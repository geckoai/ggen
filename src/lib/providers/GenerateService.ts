// import { injectable } from "@geckoai/gecko-core";
// import { ConfigureService } from "./ConfigureService";
// import { ProjectService } from "./ProjectService";
// import crypto from "crypto";
// import path from "path";
// import { Directory } from "ts-morph";
// import { Conf } from "../Conf";
// import { ServiceConf } from "../ServiceConf";
// import { OpenAPI20 } from "../open-api/v2/OpenAPI20";
// import { OpenAPI30 } from "../open-api/v3/OpenAPI30";
// import { ComponentsSchema } from "../open-api/common/ComponentsSchema";
// import { Package } from "../Package";
// import { ClassParser } from "../ClassParser";
// import { Path20 } from "../open-api/v2/Path20";
// import { Path30 } from "../open-api/v3/Path30";
// import { PathClassParser } from "../PathClassParser";
//
// @injectable()
// export class GenerateService {
//   private rootDirectory?: Directory;
//
//   constructor(
//     private configureService: ConfigureService,
//     private projectService: ProjectService,
//   ) {}
//
//   /**
//    * 读取泛型名称
//    * @param name
//    */
//   public static getGenericName(name: string) {
//     if (!/[«»<>]/g.test(name)) {
//       return {
//         name,
//       };
//     }
//     const find = (node: Generic) => {
//       if (!node.closed) {
//         return node;
//       }
//
//       if (node.parent) {
//         return find(node.parent);
//       }
//       return null;
//     };
//     const reg = /[«»,<>]/g;
//     const root: Generic = { name: "" };
//     let current = root;
//     let exec: RegExpExecArray | null;
//     let index = 0;
//     while ((exec = reg.exec(name))) {
//       const name = exec.input.slice(index, exec.index);
//       const symbols = exec.input.slice(exec.index, exec.index + 1);
//       // 开始标签建立children
//       if (/[«<]/.test(symbols)) {
//         current.name = name;
//         current.children = [];
//         const newGeneric: Generic = { name: "" };
//         // 如果已关闭 则建立兄弟节点, 否则建立子节点
//         if (current.closed) {
//           newGeneric.parent = current.parent;
//           current?.parent?.children?.push(newGeneric);
//         } else {
//           newGeneric.parent = current;
//           current.children.push(newGeneric);
//         }
//         current = newGeneric;
//       }
//
//       // 结束标签建立
//       if (/[»>]/.test(symbols)) {
//         if (name) {
//           current.name = name;
//         }
//         const f = find(current);
//         if (f) {
//           f.closed = true;
//         }
//       }
//
//       index = exec.index + 1;
//     }
//
//     if (root.name === "") {
//       root.name = name;
//     }
//     return root;
//   }
//
//   public createIndex(dirPath: string, fileName: string = "index.ts") {
//     const directory = this.projectService.getDirectory(dirPath);
//
//     if (directory) {
//       const directories = directory.getDirectories();
//       const sourceFiles = directory.getSourceFiles();
//
//       if (directories.length + sourceFiles.length > 0) {
//         const file = this.projectService.createSourceFile(
//           path.join(dirPath, fileName),
//         );
//
//         for (const dir of directories) {
//           const name = path.relative(dirPath, dir.getPath());
//
//           this.createIndex(dir.getPath());
//           const has = file.getExportDeclaration(
//             (e) => e.getModuleSpecifier()?.getText() === `"./${name}"`,
//           );
//
//           if (!has) {
//             file.addExportDeclaration({
//               moduleSpecifier: `./${name}`,
//             });
//           }
//         }
//
//         for (const sourceFile of sourceFiles) {
//           const filePath = sourceFile.getFilePath();
//
//           if (path.basename(filePath) !== "index.ts") {
//             const name = path
//               .relative(dirPath, filePath)
//               .replace(new RegExp(path.extname(filePath) + "$"), "");
//
//             const has = file.getExportDeclaration(
//               (e) => e.getModuleSpecifier()?.getText() === `"./${name}"`,
//             );
//
//             if (!has) {
//               file.addExportDeclaration({
//                 moduleSpecifier: `./${name}`,
//               });
//             }
//           }
//         }
//       }
//     }
//   }
//
//   /**
//    * 开始生成
//    * @param configFileName
//    */
//   public async generate(configFileName?: string) {
//     const config = this.configureService.readConfig(configFileName);
//     const rootPath = path.resolve(config.output);
//     this.rootDirectory = this.projectService.createDirectory(rootPath);
//     await this.createTasks(config, rootPath);
//     this.projectService.save();
//   }
//
//   private createPkgJson(pkgPath: string, pkg: Package) {
//     this.createIndex(pkgPath, pkg.main ?? "index.ts");
//
//     const pkgJson = this.projectService.createSourceFile(
//       path.join(pkgPath, "package.json"),
//     );
//
//     const dependencies: Record<string, string> = {};
//
//     pkg.dependencies.forEach((dep) => {
//       dependencies[dep.name] = dep.version;
//     });
//
//     const json: Record<string, string | string[] | object | boolean> = {
//       name: pkg.name,
//       version: pkg.version,
//       main: pkg.main,
//       private: true,
//       dependencies,
//     };
//
//     pkgJson.addStatements(JSON.stringify(json, null, 2));
//   }
//
//   private async createTasks(config: Conf, rootPath: string) {
//     const { services = [], packages = [] } = config;
//
//     for (const service of services) {
//       const OpenAPI = await service.load();
//       const servicePath = path.join(rootPath, service.path);
//       this.projectService.addSourceFileAtPaths(
//         path.join(servicePath, "**", "*.{ts, json}"),
//       );
//       this.createFiles(rootPath, servicePath, service, OpenAPI);
//     }
//
//     for (const pkg of packages) {
//       const pkgPath = path.join(rootPath, pkg.path);
//       this.projectService.addSourceFileAtPaths(
//         path.join(pkgPath, "**", "*.{ts, json}"),
//       );
//       const { services = [] } = pkg;
//       for (const service of services) {
//         const OpenAPI = await service.load();
//         const servicePath = path.join(pkgPath, service.path);
//         this.createFiles(rootPath, servicePath, service, OpenAPI);
//       }
//       this.createPkgJson(pkgPath, pkg);
//     }
//   }
//
//   private createComponentSchema(
//     componentSchema: ComponentsSchema,
//     name: string,
//     servicePath: string,
//   ) {
//     const classParser = ClassParser.create(
//       this.projectService,
//       componentSchema,
//       servicePath,
//       name,
//     );
//
//     classParser.toClass();
//     classParser.checkImport();
//   }
//
//   /**
//    * @param url 请求地址
//    * @param pathObject 描述对象
//    * @param servicePath 存放目录
//    * @param basePath 基础路径
//    * @private
//    */
//   private createPaths(
//     url: string,
//     pathObject: Path20 | Path30,
//     servicePath: string,
//     basePath?: string,
//   ) {
//     const name = crypto.createHash("md5").update(url).digest("hex");
//     const pathClassParser = PathClassParser.create(
//       this.projectService,
//       pathObject,
//       path.join(servicePath, name + ".ts"),
//       url,
//       basePath,
//     );
//     pathClassParser.toClass();
//
//     pathClassParser.checkImport();
//   }
//
//   private createFiles(
//     rootPath: string,
//     servicePath: string,
//     service: ServiceConf,
//     OpenAPI: OpenAPI20 | OpenAPI30 | null,
//   ) {
//     if (OpenAPI instanceof OpenAPI20) {
//       OpenAPI.paths?.forEach((value, name) =>
//         this.createPaths(
//           name,
//           value,
//           path.join(servicePath, "paths"),
//           OpenAPI.basePath,
//         ),
//       );
//       OpenAPI.definitions?.forEach((componentSchema, name) =>
//         this.createComponentSchema(
//           componentSchema,
//           name,
//           path.join(servicePath, "definitions"),
//         ),
//       );
//     }
//
//     if (OpenAPI instanceof OpenAPI30) {
//       OpenAPI.paths?.forEach((value, name) =>
//         this.createPaths(
//           name,
//           value,
//           path.join(servicePath, "paths"),
//           undefined,
//         ),
//       );
//       OpenAPI.components?.schemas?.forEach((componentSchema, name) =>
//         this.createComponentSchema(
//           componentSchema,
//           name,
//           path.join(servicePath, "components"),
//         ),
//       );
//     }
//   }
// }
//
// interface Generic {
//   name: string;
//   closed?: boolean;
//   children?: Generic[];
//   parent?: Generic;
// }
