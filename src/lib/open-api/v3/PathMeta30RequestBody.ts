import { PathMeta30RequestBodyContent } from "./PathMeta30RequestBodyContent";
import { TypedMap } from "@geckoai/class-transformer";
import { Helpers } from "../../helpers";

export class PathMeta30RequestBody {
  @TypedMap(PathMeta30RequestBodyContent, {
    transform: Helpers.map,
  })
  public content: Map<string, PathMeta30RequestBodyContent>;
}
