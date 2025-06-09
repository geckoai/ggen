import { Typed, TypedArray } from "@geckoai/class-transformer";
import { PathParameterSchema30 } from "./PathParameterSchema30";
import { transformer } from "../../transformer";

export class PathParameter30 {
  @Typed()
  public name: string;

  @Typed()
  public in?: string;

  @Typed()
  public description?: string;

  @Typed()
  public required?: boolean;

  @TypedArray(String)
  public enum?: string[];

  @Typed(PathParameterSchema30)
  public schema?: PathParameterSchema30;

  @TypedArray(PathParameter30)
  public children?: PathParameter30[];

  public getChildren() {
    const list: PathParameter30[] = [];
    const map = new Map<string, PathParameter30[]>();

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
        PathParameter30.create({
          name,
          children,
        }),
      );
    });
    return list;
  }

  public static create(value: Omit<PathParameter30, "getChildren">) {
    return transformer.transform(PathParameter30, value);
  }
}
