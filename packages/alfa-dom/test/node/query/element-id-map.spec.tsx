import { test } from "@siteimprove/alfa-test";

import { Query } from "../../../src";

import { h } from "../../../h";

test("#getElementIdMap() returns map from ids to elements", (t) => {
  const foo = <div id="foo" />;
  const bar = <div id="bar" />;

  const doc = h.document([foo, bar]);

  t.equal(Query.getElementIdMap(doc).get("foo").getUnsafe(), foo);
  t.equal(Query.getElementIdMap(doc).get("bar").getUnsafe(), bar);
});
