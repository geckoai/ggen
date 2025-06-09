import {Typed, TypedArray, TypedMap} from "@geckoai/class-transformer";
import { PathParameterSchema20 } from "./PathParameterSchema20";
import { PathParameter20 } from "./PathParameter20";
import {Path20} from "./Path20";
import {Helpers} from "../../helpers";
import {Path20Response} from "./Path20Response";

export class PathMeta20 {
  @TypedArray(String)
  public tags: string[];

  @Typed()
  public summary: string;

  @Typed()
  public operationId: string;

  @TypedArray(PathParameter20)
  public parameters?: PathParameter20[];

  @Typed(PathParameterSchema20)
  public schema: PathParameterSchema20;

  @TypedArray(String)
  public consumes: string[];

  @TypedArray(String)
  public produces: string[];

  @TypedMap(Path20Response, {
    transform: Helpers.map,
  })
  public responses: Map<string, Path20Response>;

  public getParameters(): PathParameter20[] {
    const list: PathParameter20[] = [];
    const map = new Map<string, PathParameter20[]>();

    this.parameters?.forEach((x) => {
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
}
