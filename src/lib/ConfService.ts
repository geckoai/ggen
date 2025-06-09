/**
 * MIT License
 * Copyright (c) 2021 RanYunLong<549510622@qq.com> @geckoai/ggen
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import path from "path";
import {Typed} from "@geckoai/class-transformer";
import {OpenAPIServiceConf} from "./OpenAPIServiceConf";
import {OpenAPI20} from "./open-api/v2/OpenAPI20";
import {OpenAPI30} from "./open-api/v3/OpenAPI30";

export class ConfService {
  /**
   * OpenAPI配置
   */
  @Typed(OpenAPIServiceConf, {required: true})
  public OpenAPI: OpenAPIServiceConf;

  /**
   * 服务名称
   */
  @Typed({required: true})
  public name: string;

  /**
   * 服务描述
   */
  @Typed(String)
  public description: string;

  public static createName(name: string) {
    let isFirst = true;
    return name.split(/[\/\-]/g).map(x => {
      x = x.trim();
      let isParams = false;
      if (/^\{/.test(x)) {
        isParams = true;
        x = x.replace(/[{}]/g, "")
      }
      const first = x.charAt(0);
      x = x.replace(first, first.toUpperCase())

      let prefix = "";
      if (isParams) {
        if (isFirst) {
          prefix = "By"
        } else {
          prefix = "With"
        }
        isFirst = false;
      }
      return prefix + x
    }).join("")
  }

  public async load(): Promise<OpenAPI20 | OpenAPI30 | null> {
    // 如果此路径为相对路径则重新组合该路径 根目录为项目根目录
    if (/\.\//.test(this.OpenAPI.url)) {
      this.OpenAPI.url = path.resolve(this.OpenAPI.url);
    }

    try {
      if (/^2/.test(this.OpenAPI.version)) {
        return OpenAPI20.load(this.OpenAPI.url);
      }

      if (/^3/.test(this.OpenAPI.version)) {
        return OpenAPI30.load(this.OpenAPI.url);
      }
    } catch (e) {

      console.error(`URL: ${this.OpenAPI.url}`);
      console.error(`Version: ${this.OpenAPI.version}`);
      console.error(e)
    }
    return null;
  }
}
