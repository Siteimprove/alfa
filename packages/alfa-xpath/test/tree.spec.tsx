import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getTree } from "../src/tree";

test("Can construct a tree", t => {
  const span = <span>Hello</span>;

  const p = <p>{span}</p>;

  const div = (
    <div>
      {p}
      <b />
    </div>
  );

  const tree = getTree(span, div);

  t(tree);
});
