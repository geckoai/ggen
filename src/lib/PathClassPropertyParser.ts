import {PathParameter30} from "./open-api/v3/PathParameter30";
import {PathParameter20} from "./open-api/v2/PathParameter20";
import {ClassDeclaration, Decorator, PropertyDeclaration, Scope, SourceFile,} from "ts-morph";
import {OpenAPI20} from "./open-api/v2/OpenAPI20";
import {OpenAPI30} from "./open-api/v3/OpenAPI30";
import {ProjectService} from "./providers/ProjectService";
import {ClassParser} from "./ClassParser";
import path from 'path';
import {ComponentsSchema} from "./open-api/common/ComponentsSchema";

export class PathClassPropertyParser {
  constructor(
    private projectService: ProjectService,
    private swagger: OpenAPI30 | OpenAPI20,
    private sourceFile: SourceFile,
    private classDeclaration: ClassDeclaration,
    private parameter: PathParameter30 | PathParameter20,
  ) {
  }

  public static create(
    projectService: ProjectService,
    swagger: OpenAPI20 | OpenAPI30,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    parameter: PathParameter30 | PathParameter20,
  ) {
    return new PathClassPropertyParser(projectService, swagger, sourceFile, classDeclaration, parameter);
  }

  private static replaceOrAddArgument(
    decorator: Decorator,
    index: number,
    value: object | string,
  ) {
    const args = decorator.getArguments();
    if (!args?.[index]) {
      decorator.addArgument(
        typeof value === "string" ? value : JSON.stringify(value, null, 2),
      );
    } else {
      args[index].replaceWithText(
        typeof value === "string" ? value : JSON.stringify(value, null, 2),
      );
    }
  }

  public toProperty() {
    const {classDeclaration, parameter, swagger, sourceFile, projectService} = this;

    // 直接继承处理
    if (parameter instanceof PathParameter20) {
      // 如果in body 2.0 直接继承 不创建字段
      if (
        parameter.in === "body" &&
        parameter.type === undefined &&
        parameter.schema &&
        parameter.schema.originalRef &&
        parameter.schema.generic?.name
      ) {
        const _extends = classDeclaration.getExtends();


        if (_extends) {
          _extends.replaceWithText(parameter.schema.generic?.toString() ?? "");
        } else {
          classDeclaration.setExtends(
            parameter.schema.generic?.toString() ?? "",
          );
        }

        if (parameter.schema.generic) {
          const name = parameter.schema.generic.toOrigin();
          let schema: ComponentsSchema | undefined;
          if (swagger instanceof OpenAPI20) {
             schema = swagger.definitions?.get(name);
          } else {
             schema = swagger.components?.schemas?.get(name);
          }
          if (schema) {
            ClassParser.create(projectService, swagger, schema, path.join(path.dirname(sourceFile.getFilePath()), 'definitions'), parameter.schema.generic.name).generate();
          }
        }

        const importDeclaration =
          this.sourceFile.getImportDeclaration(`.${parameter.schema.path}`) ??
          this.sourceFile.addImportDeclaration({
            moduleSpecifier: `.${parameter.schema.path}`,
          });

        const strings = importDeclaration
          .getNamedImports()
          .map((x) => x.getName());

        if (!strings.includes(parameter.schema.generic.name)) {
          importDeclaration.addNamedImport({
            name: parameter.schema.generic.name,
          });
        }

        return;
      }
    }

    const children = parameter.getChildren();

    const property =
      classDeclaration.getProperty(parameter.name) ??
      classDeclaration.addProperty({name: parameter.name});

    const typeList = new Set(
      property
        .getType()
        .getText()
        .split("|")
        .map((x) => x.trim()),
    );

    // 包含 . 分割的子节点处理 直接在当前文件创建一个节点对象
    if (children.length > 0) {
      const name = [
        parameter.name.slice(0, 1).toUpperCase(),
        parameter.name.slice(1),
      ].join("");
      const childClassDeclaration =
        this.sourceFile.getClass(name) ??
        this.sourceFile.insertClass(0, {name});

      children.forEach((x) =>
        PathClassPropertyParser.create(
          this.projectService,
          this.swagger,
          this.sourceFile,
          childClassDeclaration,
          x,
        ).toProperty(),
      );

      typeList.add(name);

      property.setType(
        Array.from(typeList)
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );

      property.setScope(Scope.Public);
      return;
    }

    this.decorator(property, parameter, typeList);

    if (!parameter.required) {
      property.setHasQuestionToken(true);
    }

    property.setType(
      Array.from(typeList)
        .filter((x) => !/^(any|unknown)$/.test(x))
        .join("|"),
    );

    property.setScope(Scope.Public);
  }

  private decorator(
    property: PropertyDeclaration,
    parameter: PathParameter20 | PathParameter30,
    typeList: Set<string>,
  ) {
    const decoratorApiProperty =
      property.getDecorator("ApiProperty") ??
      property.addDecorator({name: "ApiProperty"});

    const decoratorTyped =
      property.getDecorator("Typed") ??
      property.addDecorator({name: "Typed"});

    if (parameter instanceof PathParameter20) {
      PathClassPropertyParser.replaceOrAddArgument(decoratorApiProperty, 0, {
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        type: parameter.type,
      });

      switch (parameter.type) {
        case "array":
          decoratorTyped.remove();
          PathClassPropertyParser.replaceOrAddArgument(
            property.getDecorator("TypedArray") ??
            property.addDecorator({name: "TypedArray"}),
            0,
            "String",
          );
          typeList.clear();
          typeList.add("string[]");
          break;
        case "boolean":
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "Boolean",
          );
          typeList.clear();
          typeList.add("boolean");
          break;
        case "integer":
        case "number":
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "Number",
          );
          typeList.add("number");
          break;
        default:
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "String",
          );
          typeList.add("string");
      }
    } else {
      PathClassPropertyParser.replaceOrAddArgument(decoratorApiProperty, 0, {
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        type: parameter?.schema?.type ?? "string",
      });
      switch (parameter?.schema?.type) {
        case "array":
          decoratorTyped.remove();
          PathClassPropertyParser.replaceOrAddArgument(
            property.getDecorator("TypedArray") ??
            property.addDecorator({name: "TypedArray"}),
            0,
            "String",
          );
          typeList.clear();
          typeList.add("string[]");
          break;
        case "boolean":
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "Boolean",
          );
          typeList.clear();
          typeList.add("boolean");
          break;
        case "integer":
        case "number":
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "Number",
          );
          typeList.add("number");
          break;
        default:
          PathClassPropertyParser.replaceOrAddArgument(
            decoratorTyped,
            0,
            "String",
          );
          typeList.add("string");
      }
    }

    if (parameter.enum) {
      PathClassPropertyParser.replaceOrAddArgument(decoratorTyped, 1, {
        rules: {
          type: "Enum",
          enums: parameter.enum,
        },
      });

      typeList.clear();
      if (parameter instanceof PathParameter20) {
        switch (parameter.type) {
          case "integer":
          case "number":
            parameter.enum.forEach((x) => typeList.add(x));
            break;
          default:
            parameter.enum.forEach((x) => typeList.add(`"${x}"`));
            break;
        }
      } else {
        switch (parameter.schema?.type) {
          case "integer":
          case "number":
            parameter.enum.forEach((x) => typeList.add(x));
            break;
          default:
            parameter.enum.forEach((x) => typeList.add(`"${x}"`));
            break;
        }
      }
    }
  }
}
