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
import { ValidateException } from "@geckoai/class-transformer";
import { ClassConstructor } from "@geckoai/class-mirror";

export class Helpers {
  public static toString(val: unknown): string | undefined {
    return val !== undefined ? String(val) : undefined;
  }

  public static map<T extends object = ClassConstructor>(
    values: Record<PropertyKey, T>,
  ): Map<PropertyKey, T> {
    const map = new Map<PropertyKey, T>();
    Object.keys(values).forEach((key) => {
      map.set(key, values[key]);
    });
    return map;
  }

  public static top(
    exception: ValidateException & { exceptions?: ValidateException[] },
  ): Array<{
    at: string;
  }> {
    if (exception.exceptions && exception.exceptions.length > 0) {
      return [
        {
          at: exception.message,
        },
      ].concat(...exception.exceptions.map((x) => Helpers.top(x)));
    }
    return [
      {
        at: exception.message,
      },
    ];
  }

  public static formatValidateException(exceptions: ValidateException[]) {
    return exceptions.map((x) => Helpers.top(x).reverse());
  }

  public static jsonToObject<T extends object>(values: string): T | undefined;

  public static jsonToObject<T extends object>(values: string, defaults: T): T;

  public static jsonToObject<T extends object>(
    values: string,
    defaults?: T,
  ): T | undefined {
    try {
      const va = JSON.parse(values);
      return Object.assign(defaults ?? {}, va);
    } catch {
      // console.warn(err);
    }
    return defaults;
  }
}
