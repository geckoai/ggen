import {ClassDeclaration, SourceFile} from "ts-morph";
import {ComponentsSchema} from "./open-api/common/ComponentsSchema";
import {ClassGeneric} from "./ClassGeneric";
import {GenericType} from "./GenericType";
import {ClassPropertyParser} from "./ClassPropertyParser";
import {ProjectService} from "./providers/ProjectService";
import path from "path";
import {OpenAPI20} from "./open-api/v2/OpenAPI20";
import {OpenAPI30} from "./open-api/v3/OpenAPI30";

export class ClassParser {
  public readonly generic: ClassGeneric;

  public readonly classDeclaration: ClassDeclaration;

  public readonly file: SourceFile;

  constructor(
    public projectService: ProjectService,
    public swagger: OpenAPI20 | OpenAPI30,
    public readonly schema: ComponentsSchema,
    public readonly fileDir: string,
    public readonly name: string,
  ) {
    // Parse Generic
    this.generic = ClassGeneric.parse(name);

    if (this.generic.name === "List") {
      return;
    }

    // Create Source File
    this.file = projectService.createSourceFile(
      path.join(fileDir, this.generic.name + ".ts"),
    );

    // Create Class Declaration
    this.classDeclaration =
      this.file.getClass(this.generic.name) ??
      this.file.addClass({
        name: this.generic.name,
      });
  }

  public findDefinition(name: string): ComponentsSchema | undefined {
    if (this.swagger instanceof OpenAPI20) {
      return this.swagger.definitions?.get(name)
    }
    return this.swagger.components?.schemas?.get(name)
  }

  public static create(
    projectService: ProjectService,
    swagger: OpenAPI20 | OpenAPI30,
    schema: ComponentsSchema,
    fileDir: string,
    name: string,
  ) {
    return new ClassParser(projectService, swagger, schema, fileDir, name);
  }

  public createClassDeclaration() {
    const {classDeclaration} = this;

    const fd = classDeclaration?.getTypeParameters();
    // 如果包含泛型参数
    if (this.generic?.children) {
      // 如果class已经有泛型参数了
      if (fd) {
        // 如果数量不相等 更新为相等的
        if (fd.length !== this.generic.children.length) {
          classDeclaration?.getTypeParameters().map((x, i) => x.remove());
          classDeclaration?.addTypeParameters(
            this.generic.children.map((x, i) => ({
              name: GenericType[i],
            })),
          );
        }
      } else {
        classDeclaration?.addTypeParameters(
          this.generic.children.map((x, i) => ({
            name: GenericType[i],
          })),
        );
      }
    }

    this.schema.properties.forEach((property, name) =>
      new ClassPropertyParser(this, property, name).toProperty(),
    );

    classDeclaration?.setIsExported(true);
    return classDeclaration;
  }

  public generate() {
    this.createClassDeclaration();
    this.checkImport();
    // console.log(this.file.print())
  }

  public checkImportByName(names: string[], moduleSpecifier: string) {
    const importDeclaration = this.file.getImportDeclaration(
      moduleSpecifier
    );

    if (!importDeclaration) {
      this.file.addImportDeclaration({
        moduleSpecifier,
        namedImports: names
      });
      return;
    }

    const namedImports = importDeclaration.getNamedImports().map((x) => x.getName());
    const filter =  names.filter(x => !namedImports.includes(x));
    filter.forEach(name => importDeclaration.addNamedImport({name}))
  }

  public checkImport() {
    const apiPropertyDecorators = this.classDeclaration
      ?.getProperties()
      .flatMap((x) => x.getDecorator("ApiProperty"))
      .filter(Boolean);

    const typedPropertyDecorators = this.classDeclaration
      ?.getProperties()
      .flatMap(
        (x) =>
          x.getDecorator("Typed") ??
          x.getDecorator("TypedArray") ??
          x.getDecorator("TypedMap") ??
          x.getDecorator("TypedPromise") ??
          x.getDecorator("TypedSet")
      )
      .filter(Boolean);

    if (typedPropertyDecorators?.length) {
      const importDeclaration = this.file.getImportDeclaration(
        "@quick-toolkit/class-transformer",
      );

      if (!importDeclaration) {
        this.file.addImportDeclaration({
          moduleSpecifier: "@quick-toolkit/class-transformer",
          namedImports: Array.from(
            new Set<string>(
              typedPropertyDecorators.map<string>(
                (x) => x?.getName() as string,
              )
            ),
          ),
        });
      } else {
        typedPropertyDecorators.forEach(x => {
          const dn = x?.getName();
          if (dn && !importDeclaration.getNamedImports().map(x => x.getName()).includes(dn)) {
            importDeclaration.addNamedImport({name: dn})
          }
        })
      }
    }

    if (apiPropertyDecorators?.length) {
      const importDeclaration = this.file.getImportDeclaration("@quick-toolkit/http");

      if (!importDeclaration) {
        this.file.addImportDeclaration({
          moduleSpecifier: "@quick-toolkit/http",
          namedImports: Array.from(
            new Set<string>(
              apiPropertyDecorators.map<string>((x) => x?.getName() as string),
            ),
          ),
        });
      } else {
        apiPropertyDecorators.forEach((x) => {
          const name = x?.getName();
          if (name && !importDeclaration.getNamedImports().map(x => x.getName()).includes(name)) {
            importDeclaration.addNamedImport({name});
          }
        });
      }
    }
  }
}
