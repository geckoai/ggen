import {Typed, TypedMap} from "@geckoai/class-transformer";
import {Path30ResponseContent} from "./Path30ResponseContent";
import {Helpers} from "../../helpers";

export class Path30Response {
  @Typed(String)
  public description: string;

  @TypedMap(Path30ResponseContent, {
    transform: Helpers.map,
  })
  public content: Map<string, Path30ResponseContent>;
}