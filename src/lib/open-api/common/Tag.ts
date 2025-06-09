import { ExternalDocs } from "./ExternalDocs";
import { Typed } from "@geckoai/class-transformer";

export class Tag {
  @Typed()
  public name: string;

  @Typed()
  public description: string;

  @Typed(ExternalDocs)
  public externalDocs: ExternalDocs;
}
