import { Typed, TypedArray, TypedMap } from "@geckoai/class-transformer";
import { Property } from "./Property";
import { Helpers } from "../../helpers";

export class ComponentsSchema {
  @Typed()
  public type: string;

  @TypedMap(Property, {
    transform: Helpers.map,
  })
  public properties: Map<string, Property>;

  /**
   * required 包含的必填字段
   */
  @TypedArray(String)
  public required?: string[];
}
