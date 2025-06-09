import {Typed, TypedArray, TypedMap} from "@geckoai/class-transformer";
import {PathParameterSchema30} from "./PathParameterSchema30";
import {PathParameter30} from "./PathParameter30";
import {PathMeta30RequestBody} from "./PathMeta30RequestBody";
import {Path30Response} from "./Path30Response";
import {Helpers} from "../../helpers";

export class PathMeta30 {
  @TypedArray(String)
  public tags: string[];

  @Typed()
  public summary: string;

  @Typed()
  public operationId: string;

  @TypedArray(PathParameter30)
  public parameters?: PathParameter30[];

  @Typed(PathParameterSchema30)
  public schema: PathParameterSchema30;

  @Typed(PathMeta30RequestBody)
  public requestBody?: PathMeta30RequestBody;

  @TypedMap(Path30Response, {
    transform: Helpers.map,
  })
  public responses: Map<string, Path30Response>;

  public getParameters(): PathParameter30[] {
    const list: PathParameter30[] = [];
    const map = new Map<string, PathParameter30[]>();

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
        PathParameter30.create({
          name,
          children,
        }),
      );
    });

    return list;
  }
}
