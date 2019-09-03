import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getNode } from "../src/get-node";

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
    world
  );
});
