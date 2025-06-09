import { Typed } from "@geckoai/class-transformer";
import {ClassGeneric} from "../../ClassGeneric";

export class PathMeta30RequestBodySchema {
  @Typed(String)
  public $ref: string;

  public get generic(): ClassGeneric | null {
    if (this.$ref) {
      if (/#\/components\/schemas\//.test(this.$ref)) {
        return ClassGeneric.parse(this.$ref.replace(/#\/components\/schemas\//, ""));
      }
    }
    return null;
  }

  public get path() {
    if (this.$ref) {
      return `/definitions/` + this.generic?.toString();
    }
    return null;
  }
}
