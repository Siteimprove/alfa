import { Function } from "../function";
import { Tree } from "../tree";

export namespace fn {
  const prefix = "fn";

  export const root: Function<[Tree], Tree> = {
    prefix,
    name: "root",
    parameters: ["node()"],
    result: "node()",
    apply(environment, tree) {
      let root = tree;

      while (root.parent !== null) {
        root = root.parent;
      }

      return root;
    }
  };
}
