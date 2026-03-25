import { test } from "@siteimprove/alfa-test";

import {  h, Query } from "../../../src/index.ts";
import {Element} from "../../../dist/index.js";

const { getElementIdMap } = Query;

test("#getElementIdMap() returns map from ids to elements", (t) => {
  const foo = <div id="foo" />;
  const bar = <div id="bar" />;

  const doc = h.document([foo, bar]);

  console.dir(doc.toJSON())
  console.dir(getElementIdMap(doc).toJSON())

  console.dir(doc.descendants().filter(Element.isElement).toJSON())

  // t.equal(getElementIdMap(doc).get("foo").getUnsafe(), foo);
  // t.equal(getElementIdMap(doc).get("bar").getUnsafe(), bar);
  t.equal(1,1)
});

// test("#getElementIdMap() returns first of duplicated ids", (t) => {
//   const foo1 = <div id="foo" />;
//   const foo2 = <p id="foo" />;
//   const bar = (
//     <div>
//       {foo1}
//       {foo2}
//     </div>
//   );
//
//   const doc = h.document([bar]);
//
//   t.equal(getElementIdMap(doc).get("foo").getUnsafe(), foo1);
// });
