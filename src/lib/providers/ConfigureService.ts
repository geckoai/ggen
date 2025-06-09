import {transformer} from "../transformer";
import YML from "yaml";
import fs from "fs";
import path from "path";
import {Conf} from "../Conf";
import {TransformerException} from "@geckoai/class-transformer";
import {Helpers} from "../helpers";
import {injectable} from "@geckoai/gecko-core";
import {execSync} from "child_process"


@injectable()
export class ConfigureService {
  public static readConfigFile(name?: string) {
    const npmRoot = execSync('npm root', {cwd: process.cwd()}).toString().trim();

    if (name) {
      try {
        return YML.parse(fs.readFileSync(path.join(npmRoot, "..", name), "utf-8"));
      } catch (err) {
        throw err;
      }
    }

    try {
      fs.accessSync(path.join(npmRoot, "..", "openapi.config.yaml"), fs.constants.R_OK);
      return YML.parse(
        fs.readFileSync(path.join(npmRoot, "..", "openapi.config.yaml"), "utf-8"),
      );
    } catch {
    }

    try {
      fs.accessSync(path.join(npmRoot, "..", "openapi.config.yml"), fs.constants.R_OK);
      return YML.parse(
        fs.readFileSync(path.join(npmRoot, "..", "openapi.config.yml"), "utf-8"),
      );
    } catch {
    }

    try {
      fs.accessSync(path.join(npmRoot, "..", "openapi.config.json"), fs.constants.R_OK);
      return JSON.parse(
        fs.readFileSync(path.join(npmRoot, "..", "openapi.config.json"), "utf-8"),
      );
    } catch {
    }
  }

  public static config(name?: string) {
    try {
      const configFile = ConfigureService.readConfigFile(name);
      if (configFile) {
        return transformer.transform(Conf, configFile);
      }
    } catch (error) {
      if (error instanceof TransformerException) {
        (error as Error).stack =
          TransformerException.name +
          ": " +
          error.message +
          "\n" +
          Helpers.top(error.exceptions[0])
            .reverse()
            .map((x, i) => {
              return "  at: " + x.at;
            })
            .join("\r\n");
      }
      throw error;
    }
    throw new Error("Conf file not found");
  }

  /**
   * 读取配置
   * @param fileName
   */
  public readConfig(fileName?: string): Conf {
    return ConfigureService.config(fileName);
  }

  /**
   * 写入配置
   * @param fileName
   * @param config
   */
  public saveConfig(fileName: string, config: Conf) {
    if (["yml", "yaml"].includes(path.extname(fileName))) {
      fs.writeFileSync(path.resolve(fileName), YML.stringify(config));
    } else {
      fs.writeFileSync(fileName, JSON.stringify(config));
    }
    return this;
  }
}
