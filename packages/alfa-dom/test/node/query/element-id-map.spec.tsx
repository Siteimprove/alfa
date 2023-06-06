import { test } from "@siteimprove/alfa-test";
import { h } from "../../../h";

import { Query } from "../../../src";

const { getElementIdMap } = Query;

test("#getElementIdMap() returns map from ids to elements", (t) => {
  const foo = <div id="foo" />;
  const bar = <div id="bar" />;

  const doc = h.document([foo, bar]);

  t.equal(getElementIdMap(doc).get("foo").getUnsafe(), foo);
  t.equal(getElementIdMap(doc).get("bar").getUnsafe(), bar);
});

test("#getElementIdMap() returns first of duplicated ids", (t) => {
  const foo1 = <div id="foo" />;
  const foo2 = <p id="foo" />;
  const bar = (
    <div>
      {foo1}
      {foo2}
    </div>
  );

  const doc = h.document([bar]);

  t.equal(getElementIdMap(doc).get("foo").getUnsafe(), foo1);
});
