import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { compareDocumentPosition } from "../src/compare-document-position";

const foo = <em />;
const bar = <strong />;
const foobar = <span>{foo}</span>;

const context = (
  <div>
    {foobar}
    {bar}
  </div>
);

test("Returns 0 when a node is compared to itself", t => {
  t.equal(compareDocumentPosition(foo, foo, context), 0);
});

test("Returns < 0 when the first node comes before the second", t => {
  t(compareDocumentPosition(foo, bar, context) < 0);
});

test("Returns > 0 when the first node comes after the second", t => {
  t(compareDocumentPosition(bar, foo, context) > 0);
});

test("Returns 35 or 37 if the nodes are not in the same tree", t => {
  const div = <div />;
  const cmp = compareDocumentPosition(bar, div, context);
  t(cmp === 35 || cmp === 37);
});

test("Returns -20 when the other node is contained by the reference node", t => {
  t.equal(compareDocumentPosition(foobar, foo, context), -20);
});

test("Returns 10 when the reference node is contained by the other node", t => {
  t.equal(compareDocumentPosition(foo, foobar, context), 10);
});
