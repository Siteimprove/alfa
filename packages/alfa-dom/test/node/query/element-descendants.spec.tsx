import { test } from "@siteimprove/alfa-test";
import { h } from "../../../h";

import { Query } from "../../../src";

const { getElementDescendants } = Query;

test("#getElementDescendants() returns descendants non-inclusively", (t) => {
  const foo = <div id="foo" />;
  const bar = <div id="bar" />;

  const doc = h.document([foo, bar]);

  t.deepEqual(getElementDescendants(doc).toArray(), [foo, bar]);
});
