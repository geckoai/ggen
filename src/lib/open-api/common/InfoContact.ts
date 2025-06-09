import { Typed } from "@geckoai/class-transformer";

export class InfoContact {
  @Typed()
  public email: string;
}
