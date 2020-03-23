import { Node } from "@siteimprove/alfa-dom";

import { node } from "../descriptors";
import { Function } from "../function";

export namespace fn {
  const prefix = "fn";

  export const root: Function<[Node], Node> = {
    prefix,
    name: "root",
    parameters: [node()],
    result: node(),
    apply(environment, options, node) {
      return node.root(options);
    },
  };
}
