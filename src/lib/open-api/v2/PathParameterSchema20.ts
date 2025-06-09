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

    if (this.originalRef) {
      if (/#\/definitions\//.test(this.originalRef)) {
        return ClassGeneric.parse(this.originalRef.replace(/#\/definitions\//, ""));
      }
    }
    return null;
  }

  public get path() {
    if (this.generic) {
      return `/definitions/` + this.generic?.name;
    }
    return null;
  }
}
