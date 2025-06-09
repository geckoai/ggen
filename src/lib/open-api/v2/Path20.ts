import { Typed } from "@geckoai/class-transformer";
import { PathMeta20 } from "./PathMeta20";

export class Path20 {
  @Typed(PathMeta20)
  public get?: PathMeta20;

  @Typed(PathMeta20)
  public put?: PathMeta20;

  @Typed(PathMeta20)
  public delete?: PathMeta20;

  @Typed(PathMeta20)
  public post?: PathMeta20;
}
