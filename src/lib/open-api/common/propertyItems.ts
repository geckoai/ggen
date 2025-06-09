import { Typed } from "@geckoai/class-transformer";
import { ClassGeneric } from "../../ClassGeneric";
import {PathParameterSchema20} from "../v2/PathParameterSchema20";

export class PropertyItems {
  @Typed()
  public type?: string;

  @Typed()
  public description?: string;

  @Typed()
  public format?: string;

  @Typed()
  public $ref?: string;

  @Typed(PathParameterSchema20)
  public additionalProperties: PathParameterSchema20;

  /**
   * only v2
   */
  @Typed()
  public originalRef?: string;

  public static parseGeneric(name: string) {
    if (/#\/components\/schemas\//.test(name)) {
      return ClassGeneric.parse(
        name.replace(/#\/components\/schemas\//, ""),
      );
    } else if (/#\/definitions\//.test(name)) {
      return ClassGeneric.parse(name.replace(/#\/definitions\//, ""));
    }
    return ClassGeneric.parse(name);
  }



  public get generic(): ClassGeneric | null {
    if (this.originalRef) {
      return PropertyItems.parseGeneric(this.originalRef);
    }

    if (this.$ref) {
      return PropertyItems.parseGeneric(this.$ref);
    }

    if (this.additionalProperties) {
      return  PropertyItems.parseGeneric(this.additionalProperties.$ref)
    }

    return null;
  }
}
