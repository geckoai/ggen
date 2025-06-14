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
import {Typed, TypedArray} from "@geckoai/class-transformer";
import {ConfService} from "./ConfService";
import {Replace} from "./Replace";

/**
 * 配置解析类
 */
export class ConfProject {
  /**
   * 项目名称
   */
  @Typed(String, {required: true})
  public name: string;

  /**
   * 描述
   */
  @Typed(String)
  public description: string;

  @TypedArray(String)
  public globals?: string[];

  /**
   * 服务列表
   */
  @TypedArray(ConfService)
  public services?: ConfService[];

  /**
   * 替换规则和`package`模式中的`replaces`作用一样
   */
  @TypedArray(Replace)
  public replaces?: Replace[];
}
