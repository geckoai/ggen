import { Typed } from "@geckoai/class-transformer";
import { ClassGeneric } from "../../ClassGeneric";

export class PathParameterSchema20 {
  @Typed()
  public $ref: string;

  @Typed()
  public originalRef: string;

  public get generic(): ClassGeneric | null {
    if (this.$ref) {
      if (/#\/definitions\//.test(this.$ref)) {
        return ClassGeneric.parse(this.$ref.replace(/#\/definitions\//, ""));
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
