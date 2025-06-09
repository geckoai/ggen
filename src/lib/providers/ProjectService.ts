import { injectable } from "@geckoai/gecko-core";
import { Project, ts } from "ts-morph";
import ScriptTarget = ts.ScriptTarget;

@injectable()
export class ProjectService {
  private project = new Project({
    compilerOptions: {
      target: ScriptTarget.ESNext,
    },
  });

  public addSourceFileAtPaths(fileGlobs: string) {
    this.project.addSourceFilesAtPaths(fileGlobs);
  }

  public getDirectory(dirPath: string) {
    return this.project.getDirectory(dirPath);
  }

  public createDirectory(path: string) {
    const dir = this.project.getDirectory(path);
    if (!dir) {
      return this.project.createDirectory(path);
    }
    return dir;
  }

  public createSourceFile(filePath: string) {
    const file = this.project.getSourceFile(filePath);
    if (!file) {
      return this.project.createSourceFile(filePath, undefined, {
        overwrite: true,
      });
    }
    return file;
  }

  public save() {
    // this.project.getSourceFiles().map(x => {
    //   console.log(x.getFilePath())
    //
    //   console.log(x.print())
    // })
    return this.project.save();
  }
}
