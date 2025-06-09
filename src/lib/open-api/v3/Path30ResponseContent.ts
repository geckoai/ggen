import {Typed} from "@geckoai/class-transformer";
import {PathMeta30RequestBodySchema} from "./PathMeta30RequestBodySchema";

export class Path30ResponseContent {
  @Typed(PathMeta30RequestBodySchema)
  public schema: PathMeta30RequestBodySchema;
}