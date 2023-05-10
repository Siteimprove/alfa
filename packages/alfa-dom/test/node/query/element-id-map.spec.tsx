import { test } from "@siteimprove/alfa-test";
import { h } from "../../../h";

import { Query } from "../../../src";

const { getElementIdMap } = Query;

test("#getElementIdMap() returns map from ids to elements", (t) => {
  const foo = <div id="foo" />;
  const bar = <div id="bar" />;

  const doc = h.document([foo, bar]);

  t.equal(Query.getElementIdMap(doc).get("foo").getUnsafe(), foo);
  t.equal(Query.getElementIdMap(doc).get("bar").getUnsafe(), bar);
});
