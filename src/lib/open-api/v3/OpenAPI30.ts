import fs from "fs";
import axios from "axios";
import { Typed, TypedArray, TypedMap } from "@geckoai/class-transformer";
import { Server } from "./Server";
import { Components } from "./Components";
import { Info } from "../common/Info";
import { ExternalDocs } from "../common/ExternalDocs";
import { Tag } from "../common/Tag";
import { Path30 } from "./Path30";
import { Helpers } from "../../helpers";
import { transformer } from "../../transformer";

export class OpenAPI30 {
  @Typed(String)
  public openapi: string;

  @Typed(Info)
  public info: Info;

  @Typed(ExternalDocs)
  public externalDocs: ExternalDocs;

  @TypedArray(Server)
  public servers: Server[];

  @TypedArray(Tag)
  public tags: Tag[];

  @TypedMap(Path30, {
    transform: Helpers.map,
  })
  public paths: Map<string, Path30>;

  @Typed()
  public components: Components;

  /**
   * 从远程加载
   * @param url 可以是本地路径 也可以是http协议地址
   */
  public static async load(url: string) {
    if (/^http/.test(url)) {
      const res = await axios.get(url);
      return transformer.transform(OpenAPI30, res.data);
    } else {
      const file = await fs.promises.readFile(url, "utf-8");
      return transformer.transform(OpenAPI30, JSON.parse(file));
    }
  }
}
