import { PathParameterSchema20 } from "./PathParameterSchema20";
import { Typed, TypedArray } from "@geckoai/class-transformer";
import { transformer } from "../../transformer";

export class PathParameter20 {
  @Typed()
  public name: string;

  @Typed()
  public type?: string;

  @Typed()
  public in?: string;

  @Typed()
  public description?: string;

  @Typed()
  public required?: boolean;

  @TypedArray(String)
  public enum?: string[];

  @Typed(PathParameterSchema20)
  public schema?: PathParameterSchema20;

  @TypedArray(PathParameter20)
  public children?: PathParameter20[];

  public getChildren() {
    const list: PathParameter20[] = [];
    const map = new Map<string, PathParameter20[]>();

    this.children?.forEach((x) => {
      if (!/\./.test(x.name)) {
        list.push(x);
      } else {
        const strings = x.name.split(".");
        const string = strings[0];
        const g = map.get(string) ?? [];
        x.name = strings.slice(1).join(".");
        g.push(x);
        map.set(string, g);
      }
    });

    map.forEach((children, name) => {
      list.push(
        PathParameter20.create({
          name,
          children,
        }),
      );
    });

    return list;
  }

  public static create(value: Omit<PathParameter20, "getChildren">) {
    return transformer.transform(PathParameter20, value);
  }
}
