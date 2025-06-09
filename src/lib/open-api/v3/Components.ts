import { TypedMap } from "@geckoai/class-transformer";
import { ComponentsSchema } from "../common/ComponentsSchema";
import { Helpers } from "../../helpers";

export class Components {
  @TypedMap(ComponentsSchema, {
    transform: Helpers.map,
  })
  public schemas: Map<string, ComponentsSchema>;
}
