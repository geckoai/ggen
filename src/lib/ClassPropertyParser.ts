import {ClassParser} from "./ClassParser";
import {Property} from "./open-api/common/Property";
import {DecoratorStructure, OptionalKind, PropertyDeclaration, Scope,} from "ts-morph";
import {GenericType} from "./GenericType";
import {Helpers} from "./helpers";
import {ClassGeneric} from "./ClassGeneric";

export const blackList = ["List", "Map", "Object", "Boolean", "Number", "Int", "int", "Set", "object", 'string', "String", 'float', "double"];

export class ClassPropertyParser {
  public readonly propertyDeclaration: PropertyDeclaration;

  constructor(
    private classParser: ClassParser,
    private property: Property,
    private name: string,
  ) {
    this.propertyDeclaration =
      classParser.classDeclaration.getProperty(this.name) ??
      classParser.classDeclaration.addProperty({name: this.name});
  }

  public checkImport(generic: ClassGeneric) {
    const {classParser} = this;
    if (blackList.includes(generic.name)) return;
    const importDeclaration =
      classParser.file.getImportDeclaration(`./${generic.name}`) ??
      classParser.file.addImportDeclaration({
        moduleSpecifier: `./${generic.name}`,
      });

    const strings = importDeclaration
      .getNamedImports()
      .map((x) => x.getName());

    if (!strings.includes(generic.name)) {
      importDeclaration.addNamedImport({
        name: generic.name,
      });
    }

    if (generic.children) {
      generic.children.forEach(child => this.checkImport(child))
    }
  }

  public getTypeList(): string[] {
    const type = this.propertyDeclaration.getType();
    return type
      .getText()
      .split("|")
      .map((x) => x.trim());
  }

  public checkIsClassGeneric(generic: ClassGeneric, type: string, items?: boolean): boolean {
    const isSelf = this.classParser.generic.name === generic.name;

    const list = this.classParser.generic.children?.map(x => x.toString().trim());

    // 判断该节点是否为类的泛型参数
    if (
      (type === 'Map' && list?.includes(`Map<string, ${items ? `List<${generic.name}>` : generic.name}`.trim())) ||
      (type === 'Array' && list?.includes(`List<${generic.name}>`.trim())) ||
      list?.includes(generic.toString().trim())
    ) {
      // 泛型移除所有装饰器
      this.propertyDeclaration.getDecorators().map(x => x.remove())
      this.createDecorator({
        name: "Typed",
        arguments: [`Any`]
      })
      this.classParser.checkImportByName(['Any'], 'quick-toolkit/class-transformer');
      this.propertyDeclaration.setType(GenericType[0]);
    } else {
      const typeList = this.getTypeList();
      const name = `Typed${type}`

      if (isSelf) {
        if (type === "Map" && items) {
          this.createDecorator({
            name,
            arguments: [`TypeMirror.createArrayMirror(() => ${generic.name})`]
          })
        } else {
          this.createDecorator({
            name,
            arguments: [`TypeMirror.from(() => ${generic.name})`]
          })
        }
        this.classParser.checkImportByName(['TypeMirror'], 'quick-toolkit/class-transformer');
      } else {
        if (type === "Map") {
          this.createDecorator({
            name,
            arguments: [items ? `TypeMirror.createArrayMirror(() => ${generic.name})` : `TypeMirror.from(() => ${generic.name})`]
          })
          this.classParser.checkImportByName(['TypeMirror'], 'quick-toolkit/class-transformer');
        } else {
          this.createDecorator({
            name,
            arguments: [generic.name]
          })
        }
      }
      const elementName = items ? `${generic.name}[]` : generic.name;
      const typeName = type === 'Map' ? 'Map<string, ${elementName}>' : elementName
      this.propertyDeclaration.setType(
        Array.from(
          new Set(
            typeList
              .concat([typeName])
              .filter(Boolean)
              .filter((x) => !/^(any|unknown)$/.test(x)),
          ),
        ).join("|"),
      );

      if (!isSelf) {
        this.checkImport(generic);
      }
    }
    return isSelf;
  }

  public toProperty() {
    const {propertyDeclaration, classParser} = this;
    const {schema, projectService, swagger, fileDir} = classParser;

    // decorator
    this.createDecorator({
      name: "ApiProperty",
      arguments: [
        JSON.stringify(
          {
            type: this.property.type,
            description: this.property.description,
            required: this.property.required
              ? schema.required?.includes(this.name)
              : undefined,
          },
          null,
          2,
        ),
      ],
    });

    // Question Token
    if (!schema.required?.includes(this.name)) {
      propertyDeclaration.setHasQuestionToken(true);
    }

    // JS DOC
    if (this.property.description) {
      const find = propertyDeclaration
        .getJsDocs()
        .find((x) => x.getDescription() === this.property.description);

      if (!find) {
        propertyDeclaration.addJsDoc({
          description: this.property.description,
        });
      }
    }

    // 如果是泛型参数 则跳过处理1
    if (!this.property.generic && !this.property.items?.generic && !this.property?.additionalProperties?.generic && !this.property?.additionalProperties?.items?.generic) {
      const typeList = this.getTypeList();

      switch (this.property.type) {
        case "object":
          propertyDeclaration.setType(
            Array.from(new Set(typeList.concat(["object"])))
              .filter(Boolean)
              .filter((x) => !/^(any|unknown)$/.test(x))
              .join("|"),
          );
          break;
        case "boolean":
          propertyDeclaration.setType(
            Array.from(new Set(typeList.concat(["boolean"])))
              .filter(Boolean)
              .filter((x) => !/^(any|unknown)$/.test(x))
              .join("|"),
          );
          break;
        case "string":
          this.string(typeList);
          break;
        case "number":
        case "integer":
          this.number(typeList);
          break;
        case "array":
          this.array(typeList);
          break;
        default:
          propertyDeclaration.setType(
            Array.from(new Set(typeList.concat(["unknown"])))
              .filter(Boolean)
              .join("|"),
          );
      }
    }


    if (this.property.generic) {
      if (!this.checkIsClassGeneric(this.property.generic, ''))  {
        const definition = this.classParser.findDefinition(this.property.generic.toOrigin());
        if (definition) {
          ClassParser.create(projectService, swagger, definition, fileDir, this.property.generic.toOrigin()).generate();
        }
      }
    }

    if (this.property.items?.generic) {
      if (!this.checkIsClassGeneric(this.property.items.generic, 'Array', true)) {
        const definition = this.classParser.findDefinition(this.property.items.generic.toOrigin());
        if (definition) {
          ClassParser.create(projectService, swagger, definition, fileDir, this.property.items.generic.toOrigin()).generate();
        }
      }
    }

    if (this.property.additionalProperties) {
      if (this.property.additionalProperties.generic) {
        if (!this.checkIsClassGeneric(this.property.additionalProperties.generic, 'Map')) {
          const definition = this.classParser.findDefinition(this.property.additionalProperties.generic.toOrigin());
          if (definition) {
            ClassParser.create(projectService, swagger, definition, fileDir, this.property.additionalProperties.generic.toOrigin()).generate();
          }
        }

      } else if (this.property.additionalProperties.items?.generic) {
        if (!this.checkIsClassGeneric(this.property.additionalProperties.items.generic, 'Map', true)) {
          const definition = this.classParser.findDefinition(this.property.additionalProperties.items.generic.toOrigin());
          if (definition) {
            ClassParser.create(projectService, swagger, definition, fileDir, this.property.additionalProperties.items.generic.toOrigin()).generate();
          }
        }
      }
    }

    propertyDeclaration.setScope(Scope.Public);
    return propertyDeclaration;
  }

  private createDecorator(structure: OptionalKind<DecoratorStructure>) {
    const decorator = this.propertyDeclaration.getDecorator(structure.name);
    if (!decorator) {
      return this.propertyDeclaration.addDecorator(structure);
    }
    return decorator;
  }

  private string(typeList: string[]) {
    const decorator = this.createDecorator({name: "Typed"});
    const args = decorator.getArguments();

    if (!args?.[0]) {
      decorator.addArgument("String");
    } else {
      args?.[0].replaceWithText("String");
    }

    if (this.property.enum) {
      const values = Helpers.jsonToObject<{
        rules: { type: string; enums: string[] };
      }>(args?.[1]?.getFullText(), {
        rules: {
          type: "Enum",
          enums: [],
        },
      });

      for (const string of this.property.enum) {
        if (!values.rules.enums.includes(string + "")) {
          values.rules.enums.push(string + "");
        }
      }

      if (!args?.[1]) {
        decorator.addArgument(JSON.stringify(values, null, 2));
      } else {
        args?.[1].replaceWithText(JSON.stringify(values, null, 2));
      }

      this.propertyDeclaration?.setType(
        Array.from(
          new Set(typeList.concat(values.rules.enums.map((x) => `"${x}"`))),
        )
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );
      return;
    } else {
      this.propertyDeclaration.setType(
        Array.from(new Set(typeList.concat(["string"])))
          .filter(Boolean)
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );
    }
  }

  private number(typeList: string[]) {
    const decorator = this.createDecorator({name: "Typed"});
    const args = decorator.getArguments();

    if (!args?.[0]) {
      decorator.addArgument("Number");
    } else {
      args?.[0].replaceWithText("String");
    }

    if (this.property.enum) {
      const values = Helpers.jsonToObject<{
        rules: { type: string; enums: string[] };
      }>(args?.[1].getFullText(), {
        rules: {
          type: "Enum",
          enums: [],
        },
      });

      for (const string of this.property.enum) {
        if (!values.rules.enums.includes(string)) {
          values.rules.enums.push(string);
        }
      }

      if (!args?.[1]) {
        decorator.addArgument(JSON.stringify(values, null, 2));
      } else {
        args?.[1].replaceWithText(JSON.stringify(values, null, 2));
      }

      this.propertyDeclaration?.setType(
        Array.from(new Set(typeList.concat(values.rules.enums)))
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );
      return;
    } else {
      this.propertyDeclaration.setType(
        Array.from(new Set(typeList.concat(["number"])))
          .filter(Boolean)
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );
    }
  }

  private array(typeList: string[]) {
    const generic = this.property.items?.generic;
    if (!generic) {
      if (this.property.items?.type) {
        switch (this.property.items.type) {
          case "string": {
            const decorator = this.createDecorator({
              name: "TypedArray",
            });

            const args = decorator.getArguments();

            if (!args?.[0]) {
              decorator.addArgument(String.name);
            }
            this.propertyDeclaration.setType(
              Array.from(new Set(typeList.concat(["string[]"])))
                .filter((x) => !/^(any|unknown)$/.test(x))
                .join("|"),
            );
          }
            break;
          case "number":
          case "integer": {
            const decorator = this.createDecorator({
              name: "TypedArray",
            });
            const args = decorator.getArguments();
            if (!args?.[0]) {
              decorator.addArgument(Number.name);
            }
            this.propertyDeclaration.setType(
              Array.from(new Set(typeList.concat(["number[]"])))
                .filter((x) => !/^(any|unknown)$/.test(x))
                .join("|"),
            );
          }
            break;
          case "boolean": {
            const decorator = this.createDecorator({
              name: "TypedArray",
            });
            const args = decorator.getArguments();
            if (!args?.[0]) {
              decorator.addArgument(Boolean.name);
            }
            this.propertyDeclaration.setType(
              Array.from(new Set(typeList.concat(["boolean[]"])))
                .filter((x) => !/^(any|unknown)$/.test(x))
                .join("|"),
            );
          }
            break;
        }
      }
      return;
    }

    const index = this.classParser.generic?.children
      ?.map((x) => x.toString())
      .indexOf(`List<${generic.toString()}>`);

    // 如果包含说明该参数是泛型参数
    if (index !== undefined && index !== -1) {
      this.propertyDeclaration.setType(GenericType[index]);
    } else {
      const isSelf = this.classParser.generic.name === generic.name
      this.createDecorator({
        name: "TypedArray",
        arguments: [isSelf ? `TypeMirror.from(() => ${generic.name})` : generic.name],
      });
      if (isSelf) {
        this.classParser.checkImportByName(['TypeMirror'], 'quick-toolkit/class-transformer');
      }
      this.propertyDeclaration.setType(
        Array.from(new Set(typeList.concat([generic.toString() + "[]"])))
          .filter((x) => !/^(any|unknown)$/.test(x))
          .join("|"),
      );
    }
  }
}
