import { Typed } from "@geckoai/class-transformer";

export class InfoLicense {
  @Typed()
  public name: string;

  @Typed()
  public url: string;
}
