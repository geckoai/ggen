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
import {Bootstrap, GeckoModule} from "@geckoai/gecko-core";
import {ProjectService} from "./providers/ProjectService";
import {ConfigureService} from "./providers/ConfigureService";
import {PathMeta20} from "./open-api/v2/PathMeta20";
import {PathMeta30} from "./open-api/v3/PathMeta30";
import {PathClassParser} from "./PathClassParser";
import {OpenAPI20} from "./open-api/v2/OpenAPI20";
import {OpenAPI30} from "./open-api/v3/OpenAPI30";

/**
 * @class Core
 */
@GeckoModule({
  providers: [ProjectService, ConfigureService,],
})
export class Core {
  constructor(
    private projectService: ProjectService,
    private configureService: ConfigureService,
  ) {
  }

  public static run() {
    return Bootstrap.run(Core);
  }

  public readConfig(fileName?: string) {
    return this.configureService.readConfig(fileName);
  }

  public generate(name: string, meta: PathMeta20 | PathMeta30, url: string, method: string, swagger: OpenAPI20 | OpenAPI30) {
    PathClassParser.create(swagger, this.projectService, meta, process.cwd(), name, url, method).generate();
    return this.projectService.save();
  }
}
