import { Typed } from "@geckoai/class-transformer";
import { ClassGeneric } from "../../ClassGeneric";

export class PropertyItems {
  @Typed()
  public type?: string;

  @Typed()
  public description?: string;

  @Typed()
  public format?: string;

  @Typed()
  public $ref?: string;

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

    return null;
  }
}
