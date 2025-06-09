import {ProjectService} from "./providers/ProjectService";
import {ClassDeclaration, SourceFile,} from "ts-morph";
import {PathMeta20} from "./open-api/v2/PathMeta20";
import {PathMeta30} from "./open-api/v3/PathMeta30";
import {PathClassPropertyParser} from "./PathClassPropertyParser";
import path from 'path';
import {OpenAPI30} from "./open-api/v3/OpenAPI30";
import {OpenAPI20} from "./open-api/v2/OpenAPI20";
import {ComponentsSchema} from "./open-api/common/ComponentsSchema";
import {Path20Response} from "./open-api/v2/Path20Response";
import {ClassParser} from "./ClassParser";

export class PathClassParser {
  private sourceFile: SourceFile;

  constructor(
    private swagger: OpenAPI30 | OpenAPI20,
    private projectService: ProjectService,
    private meta: PathMeta20 | PathMeta30,
    private filePath: string,
    private cName: string,
    private url: string,
    private method: string,
  ) {
    this.sourceFile = this.projectService.createSourceFile(path.join(this.filePath, cName + '.ts'));
  }

  public static create(
    swagger: OpenAPI20 | OpenAPI30,
    projectService: ProjectService,
    pathObject: PathMeta20 | PathMeta30,
    fileDir: string,
    cName: string,
    url: string,
    method: string,
  ) {
    return new PathClassParser(
      swagger,
      projectService,
      pathObject,
      fileDir,
      cName,
      url,
      method,
    );
  }

  public createClassDeclaration() {
    const {cName: name, meta, url, method, swagger, sourceFile, projectService} = this;

    {
      const response = meta.responses.get("200");
      let schema: ComponentsSchema | undefined;
      let name: string = "";

      if (response instanceof Path20Response) {
        name = response.schema?.generic?.toOrigin() ?? "";
        schema = name ? (swagger as OpenAPI20).definitions.get(name) : undefined;
      } else {
        name = response?.content?.get("*/*")?.schema?.generic?.toOrigin() ?? "";
        schema = name ? (swagger as OpenAPI30).components?.schemas?.get(name) : undefined;
      }

      if (schema) {
        ClassParser.create(projectService, swagger, schema, path.join(path.dirname(sourceFile.getFilePath()), 'definitions'), name).generate();
      }
    }

    const classDeclaration =
      sourceFile.getClass(name) ?? sourceFile.addClass({name});

    meta
      .getParameters()
      ?.forEach((parameter) =>
        PathClassPropertyParser.create(
          this.projectService,
          this.swagger,
          this.sourceFile,
          classDeclaration,
          parameter,
        ).toProperty(),
      );

    if (meta instanceof PathMeta30) {
      const keys = meta.requestBody?.content?.keys();
      this.createDecorator(classDeclaration, "ApiRequest", {
        url,
        method,
        description: meta.summary,
        contentType: keys ? Array.from(keys)?.[0] : undefined,
        // response: meta.responses.get("200")?.content?.schema?.generic?.toOrigin(),
        // responseType: meta.responses.get("200")?.content?.schema?.generic?.toList()
      });
    } else {
      this.createDecorator(classDeclaration, "ApiRequest", {
        url,
        method,
        description: meta.summary,
        contentType: meta.consumes?.[0],
        // response: meta.responses.get("200")?.schema?.generic?.toString(),
        // responseType: meta.responses.get("200")?.schema?.generic?.toList(),
      });
    }

    classDeclaration.setIsExported(true);
    return classDeclaration;
  }

  public createDecorator(
    classDeclaration: ClassDeclaration,
    name: string,
    values: object,
  ) {
    const find = classDeclaration.getDecorator(name);

    if (!find) {
      return classDeclaration.addDecorator({
        name,
        arguments: [JSON.stringify(values, null, 2)],
      });
    } else {
      const args = find.getArguments();

      if (!args?.[0]) {
        find.addArgument(JSON.stringify(args, null, 2));
      } else {
        args[0].replaceWithText(JSON.stringify(values, null, 2));
      }
    }
    return find;
  }

  public generate() {
    this.createClassDeclaration();
    this.checkImport();
  }

  public checkImport() {
    this.sourceFile.getClasses().map((c) => {
      const apiPropertyDecorators = c
        .getProperties()
        .flatMap((x) => x.getDecorator("ApiProperty"))
        .filter(Boolean);

      const decorators = c.getDecorators().map((x) => x.getName());

      const typedPropertyDecorators = c
        .getProperties()
        .flatMap(
          (x) =>
            x.getDecorator("Typed") ??
            x.getDecorator("TypedArray") ??
            x.getDecorator("TypedMap") ??
            x.getDecorator("TypedPromise") ??
            x.getDecorator("TypedSet") ??
            x.getDecorator("TypedAny"),
        )
        .filter(Boolean);

      if (typedPropertyDecorators?.length) {
        const importDeclaration = this.sourceFile.getImportDeclaration(
          "@quick-toolkit/class-transformer",
        );

        if (!importDeclaration) {
          this.sourceFile.addImportDeclaration({
            moduleSpecifier: "@quick-toolkit/class-transformer",
            namedImports: Array.from(
              new Set<string>(
                typedPropertyDecorators.map<string>(
                  (x) => x?.getName() as string,
                ),
              ),
            ),
          });
        } else {
          const namedImports = importDeclaration
            .getNamedImports()
            .map((x) => x.getName());
          typedPropertyDecorators.forEach((x) => {
            const name = x?.getName();
            if (name && !namedImports.includes(name)) {
              importDeclaration.addNamedImport({name});
            }
          });
        }
      }

      if (apiPropertyDecorators?.length || decorators.length) {
        const importDeclaration =
          this.sourceFile.getImportDeclaration("@quick-toolkit/http");

        if (!importDeclaration) {
          this.sourceFile.addImportDeclaration({
            moduleSpecifier: "@quick-toolkit/http",
            namedImports: Array.from(
              new Set<string>(
                apiPropertyDecorators
                  .map<string>((x) => x?.getName() as string)
                  .concat(decorators),
              ),
            ),
          });
        } else {
          const namedImports = importDeclaration
            .getNamedImports()
            .map((x) => x.getName());

          const imports = new Set<string>();

          apiPropertyDecorators.forEach((x) => {
            const name = x?.getName();
            if (name && !namedImports.includes(name)) {
              imports.add(name);
            }
          });

          decorators.forEach((name) => {
            if (!namedImports.includes(name)) {
              imports.add(name);
              // importDeclaration.addNamedImport({ name });
            }
          });

          imports.forEach((name) => importDeclaration.addNamedImport({name}));
        }
      }
    });
  }
}
