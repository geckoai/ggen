import { Typed } from "@geckoai/class-transformer";

export class ExternalDocs {
  @Typed()
  public description: string;

  @Typed()
  public url: string;
}
