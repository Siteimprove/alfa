import { test } from "@siteimprove/alfa-test";

import { Query } from "../../../src";

const { getElementDescendants } = Query;

test("#getElementDescendants() returns descendants non-inclusively", (t) => {
  const foo = <p>foo</p>;
  const bar = <div>{foo}</div>;

  t.deepEqual(getElementDescendants(bar).toArray(), [foo]);
});
