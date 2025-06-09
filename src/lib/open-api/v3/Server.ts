import { Typed } from "@geckoai/class-transformer";

export class Server {
  @Typed()
  public url: string;
}
