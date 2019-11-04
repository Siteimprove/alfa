import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Some } from "@siteimprove/alfa-option";
import { getNode } from "../src/get-node";
import { Node } from "../src/types";

test("Gets the node at a given document position within a context", t => {
  const world = <span>world</span>;

  t.equal(
    getNode(
      <div>
        <p>Hello {world}</p>
        <button />
      </div>,
      3
    ),
    Some.of(world as Node)
  );
});
