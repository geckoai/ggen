import {Typed} from "@geckoai/class-transformer";
import {PropertyItems} from "./propertyItems";
import {ClassGeneric} from "../../ClassGeneric";

export class AdditionalProperties {
  @Typed()
  public type: string;

  @Typed()
  public $ref: string;

  @Typed(PropertyItems)
  public items?: PropertyItems;

  public get generic(): ClassGeneric | null {
    if (this.$ref) {
      if (/#\/components\/schemas\//.test(this.$ref)) {
        return ClassGeneric.parse(
          this.$ref.replace(/#\/components\/schemas\//, ""),
        );
      } else if (/#\/definitions\//.test(this.$ref)) {
        return ClassGeneric.parse(this.$ref.replace(/#\/definitions\//, ""));
      }
    }
    return null;
  }
}