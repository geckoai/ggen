import { Typed } from "@geckoai/class-transformer";

export class Replace {
  /**
   * 目标名称
   */
  @Typed(String)
  public target: string;

  /**
   * 替换名称
   */
  @Typed(String)
  public to: string;
}
