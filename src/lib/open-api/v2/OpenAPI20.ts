import { Typed, TypedArray, TypedMap } from "@geckoai/class-transformer";
import { Info } from "../common/Info";
import { Tag } from "../common/Tag";
import { ComponentsSchema } from "../common/ComponentsSchema";
import { Path20 } from "./Path20";
import { Helpers } from "../../helpers";
import axios from "axios";
import { transformer } from "../../transformer";
import fs from "fs";

export class OpenAPI20 {
  @Typed()
  public swagger: string;

  @Typed(Info)
  public info: Info;

  @Typed()
  public host: string;

  @Typed()
  public basePath: string;

  @TypedArray(Tag)
  public tags: Tag[];

  @TypedMap(Path20, {
    transform: Helpers.map,
  })
  public paths: Map<string, Path20>;

  @TypedMap(ComponentsSchema, {
    transform: Helpers.map,
  })
  public definitions: Map<string, ComponentsSchema>;

  /**
   * 从远程加载
   * @param url 可以是本地路径 也可以是http协议地址
   */
  public static async load(url: string) {
    if (/^http/.test(url)) {
      const res = await axios.get(url);
      return transformer.transform(OpenAPI20, res.data);
    } else {
      const file = await fs.promises.readFile(url, "utf-8");
      return transformer.transform(OpenAPI20, JSON.parse(file));
    }
  }
}
