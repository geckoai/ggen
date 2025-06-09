import { describe } from "mocha";

interface Generic {
  name: string;
  closed?: boolean;
  children?: Generic[];
  parent?: Generic;
}

function find(node: Generic) {
  if (!node.closed) {
    return node;
  }

  if (node.parent) {
    return find(node.parent);
  }
  return null;
}

describe("open api  transform", () => {
  it("should OpenAPI30.ts", async () => {
    const str = `HttpResource`;
    const reg = /[«»,<>]/g;
    const root: Generic = { name: "" };
    let current = root;
    let exec: RegExpExecArray | null;
    let index = 0;
    while ((exec = reg.exec(str))) {
      const name = exec.input.slice(index, exec.index);
      const symbols = exec.input.slice(exec.index, exec.index + 1);
      // 开始标签建立children
      if (/[«<]/.test(symbols)) {
        current.name = name;
        current.children = [];
        const newGeneric: Generic = { name: "" };
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

    console.log(root);
  });
});

// HttpResource«List«SysParameter«Object»,AAAAA«Object»»»
