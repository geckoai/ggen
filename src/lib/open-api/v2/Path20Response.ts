import {Typed} from "@geckoai/class-transformer";
import {PathParameterSchema20} from "./PathParameterSchema20";

export class Path20Response {
  @Typed(String)
  public description: string;


  @Typed(PathParameterSchema20)
  public schema: PathParameterSchema20;
}