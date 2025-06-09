import { Typed, TypedArray } from "@geckoai/class-transformer";
import { PropertyItems } from "./propertyItems";
import { ClassGeneric } from "../../ClassGeneric";

export class Property {
  @Typed()
  public type: string;

  @Typed()
  public format: string;

  @Typed()
  public description?: string;

  @TypedArray(String)
  public enum?: string[];

  @Typed(PropertyItems)
  public items?: PropertyItems;

  /**
   * required 包含的必填字段
   */
  @Typed()
  public required?: boolean;

  @Typed()
  public $ref?: string;

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
