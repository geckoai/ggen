export class ClassGeneric {
  public closed: boolean = false;

  public children?: ClassGeneric[] = undefined;

  private constructor(
    public name: string,
    public parent?: ClassGeneric,
  ) {}

  public static parse(name: string) {
    if (!/[«»<>]/g.test(name)) {
      return new ClassGeneric(name);
    }
    const find = (node: ClassGeneric) => {
      if (!node.closed) {
        return node;
      }

      if (node.parent) {
        return find(node.parent);
      }
      return null;
    };
    const reg = /[«»,<>]/g;
    const root: ClassGeneric = new ClassGeneric("");
    let current = root;
    let exec: RegExpExecArray | null;
    let index = 0;
    while ((exec = reg.exec(name))) {
      const name = exec.input.slice(index, exec.index);
      const symbols = exec.input.slice(exec.index, exec.index + 1);
      // 开始标签建立children
      if (/[«<]/.test(symbols)) {
        current.name = name;
        current.children = [];
        const newGeneric: ClassGeneric = new ClassGeneric("");
        // 如果已关闭 则建立兄弟节点, 否则建立子节点
        if (current.closed) {
          newGeneric.parent = current.parent;
          current?.parent?.children?.push(newGeneric);
        } else {
          newGeneric.parent = current;
          current.children.push(newGeneric);
        }
        current = newGeneric;
      }

      // 结束标签建立
      if (/[»>]/.test(symbols)) {
        if (name) {
          current.name = name;
        }
        const f = find(current);
        if (f) {
          f.closed = true;
        }
      }

      index = exec.index + 1;
    }

    if (root.name === "") {
      root.name = name;
    }
    return root;
  }

  public toString(): string {
    if (this.children?.length) {
      return (
        this.name + "<" + this.children.map((x) => x.toString()).join(",") + ">"
      );
    }
    return this.name;
  }

  public toOrigin(): string {
    if (this.children?.length) {
      return (
        this.name + "«" + this.children.map((x) => x.toOrigin() as string).filter(Boolean).join(",") + "»"
      );
    }
    return this.name;
  }

  public toList() {
    const list = [this.name]
    if (this.children) {
      this.children.forEach(c => {
        list.push(...c.toList())
      })
    }
    return list
  }

  public toGenericList() {
    const list = [this.toString()]
    if (this.children) {
      this.children.forEach(c => {
        list.push(...c.toList())
      })
    }
    return list
  }
}
