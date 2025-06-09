import { Typed } from "@geckoai/class-transformer";
import { PathMeta30 } from "./PathMeta30";

export class Path30 {
  @Typed(PathMeta30)
  public get?: PathMeta30;

  @Typed(PathMeta30)
  public put?: PathMeta30;

  @Typed(PathMeta30)
  public delete?: PathMeta30;

  @Typed(PathMeta30)
  public post?: PathMeta30;
}
