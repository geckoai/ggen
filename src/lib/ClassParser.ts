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

    // 创建子类
    // this.generic.children?.forEach(child => {
    //   if (child.name === "List") {
    //     child.children?.forEach(c => {
    //       let _schema: ComponentsSchema | undefined;
    //       const name = c.toOrigin();
    //       if (swagger instanceof OpenAPI20) {
    //         _schema = swagger.definitions.get(name);
    //       } else  {
    //         _schema = swagger.components?.schemas?.get(name);
    //       }
    //       if (_schema) {
    //         ClassParser.create(projectService, swagger, _schema, this.fileDir, c.name).generate();
    //       }
    //     })
    //     return;
    //   }
    //   let _schema: ComponentsSchema | undefined;
    //   const name = child.toOrigin();
    //   if (swagger instanceof OpenAPI20) {
    //     _schema = swagger.definitions.get(name);
    //   } else  {
    //     _schema = swagger.components?.schemas?.get(name);
    //   }
    //   if (_schema) {
    //     ClassParser.create(projectService, swagger, _schema, this.fileDir, child.name).generate();
    //   }
    // })

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
        "@geckoai/class-transformer",
      );

      if (!importDeclaration) {
        const filter = typedPropertyDecorators?.filter(x => x?.getName() === "Typed" && x?.getArguments().find(x => x.getText() === "Any")).map(() => "Any");

        this.file.addImportDeclaration({
          moduleSpecifier: "@geckoai/class-transformer",
          namedImports: Array.from(
            new Set<string>(
              typedPropertyDecorators.map<string>(
                (x) => x?.getName() as string,
              ).concat(filter)
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

    if (apiPropertyDecorators?.length) {
      const importDeclaration = this.file.getImportDeclaration("@geckoai/http");

      if (!importDeclaration) {
        this.file.addImportDeclaration({
          moduleSpecifier: "@geckoai/http",
          namedImports: Array.from(
            new Set<string>(
              apiPropertyDecorators.map<string>((x) => x?.getName() as string),
            ),
          ),
        });
      } else {
        const namedImports = importDeclaration
          .getNamedImports()
          .map((x) => x.getName());

        apiPropertyDecorators.forEach((x) => {
          const name = x?.getName();
          if (name && !namedImports.includes(name)) {
            importDeclaration.addNamedImport({name});
          }
        });
      }
    }
  }
}
