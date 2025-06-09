import { Typed } from "@geckoai/class-transformer";
import { InfoContact } from "./InfoContact";
import { InfoLicense } from "./InfoLicense";

export class Info {
  @Typed()
  public title: string;

  @Typed()
  public description: string;

  @Typed()
  public termsOfService: string;

  @Typed(InfoContact)
  public contact: InfoContact;

  @Typed(InfoLicense)
  public license: InfoLicense;

  @Typed()
  public version: string;
}
