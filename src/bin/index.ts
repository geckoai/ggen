#!/usr/bin/env node
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

import 'reflect-metadata';
import {program} from 'commander'
import ora from 'ora';
import {input, search, select} from '@inquirer/prompts';
import {Core} from "../lib/core";
import {Path20} from "../lib/open-api/v2/Path20";
import {PathMeta20} from "../lib/open-api/v2/PathMeta20";
import {PathMeta30} from "../lib/open-api/v3/PathMeta30";
import {Path30} from "../lib/open-api/v3/Path30";
import {ConfService} from "../lib/ConfService";
import {OpenAPI20} from "../lib/open-api/v2/OpenAPI20";

program
  .command("swagger")
  .option("-c, --config <path>", "config file path.")
  .description("open api generate.")
  .action(async ({config = "openapi.config.yaml"}) => {
    const {instance} = Core.run();
    const conf = instance.readConfig(config);
    try {
      const project = await search({
        message: "which project do you want to choose?",
        source: async (input) => conf.projects.filter((p) => new RegExp(input || "", "i").test(p.name)).map(p => ({
          value: p.name,
          name: p.name ?? p.name,
          description: p.description ?? p.name,
        }))
      })

      const services = conf.projects.find(p => p.name === project)?.services ?? []

      if (services.length === 0) {
        console.warn("no services found.")
        return;
      }

      const service = await search({
        message: "Which service do you want to choose?",
        source: async (input) => services.filter((p) => new RegExp(input || "", "i").test(p.name)).map(p => ({
          value: p.name,
          name: p.name ?? p.name,
          description: p.description ?? p.name,
        }))
      })

      const find = services.find(s => s.name === service);

      if (!find) {
        console.warn("No service found.")
        return;
      }

      const spinner = ora(`Load file: ${find.OpenAPI.url}`).start();
      const swagger = await find.load();
      spinner.stop();

      if (!swagger) {
        console.warn("No path found.")
        return
      }

      const paths = Array.from(swagger.paths as Map<string, Path20 | Path30>).map(([p, info]) => {
        const keys = Object.keys(info).filter((m) => info[m as unknown as keyof Path20]);
        let description = '';
        const tags = new Set<string>();
        const subjects: string[] = [];
        keys.forEach((type, index) => {
          const o = info[type as unknown as keyof Path20] as PathMeta20 | PathMeta30;
          o?.tags.forEach((tag) => {
            tags.add(tag)
          });
          subjects.push(`\t${index + 1}) ${type}: ${o.summary}`)
        })

        description += Array.from(tags).join("|") + '\r\n';
        description += subjects.join('\r\n');

        return {
          value: p,
          name: p,
          description
        }
      })

      const path = await search({
        message: "Which path do you want to choose?",
        source: async (input) => paths.filter((p) => new RegExp(input || "", "i").test(p.value))
      })

      const pathObject = swagger.paths.get(path) as Record<keyof Path20, PathMeta20 | PathMeta30>;

      if (!pathObject) {
        console.warn("No path method found.")
        return;
      }

      const methods: string[] = Object.keys(pathObject).filter(x => (pathObject as any)[x]);

      const method: string = await select({
        message: "Which method do you want to choose?",
        choices: methods,
      })

      const name = await input({
        message: "Please enter name!",
        required: true,
        default: ConfService.createName([method, path].join("/"))
      })

      const basePath = swagger instanceof OpenAPI20 ? swagger.basePath : ""

      await instance.generate(name, pathObject[method as keyof Path20], [basePath, path].filter(Boolean).join(""), method, swagger)

      console.log("Generated.")
    } catch(e) {
      if (e?.constructor.name === "ExitPromptError") {
        process.exit(0)
      }
      console.error(e)
    }
  })

program
  .version("0.0.1")


program.parse();