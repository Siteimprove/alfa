import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { compareDocumentPosition } from "../src/compare-document-position";

const em = <em />;
const strong = <strong />;
const span = <span>{em}</span>;

const context = (
  <div>
    {span}
    {strong}
  </div>
);

test("Returns 0 when a node is compared to itself", t => {
  t.equal(compareDocumentPosition(em, em, context), 0);
});

test("Returns < 0 when the first node comes before the second", t => {
  t(compareDocumentPosition(em, strong, context) < 0);
});

test("Returns > 0 when the first node comes after the second", t => {
  t(compareDocumentPosition(strong, em, context) > 0);
});

test("Returns 35 or 37 if the nodes are not in the same tree", t => {
  const div = <div />;
  const cmp = compareDocumentPosition(strong, div, context);
  t(cmp === 35 || cmp === 37);
});

test("Returns -20 when the other node is contained by the reference node", t => {
  t.equal(compareDocumentPosition(span, em, context), -20);
});

test("Returns 10 when the reference node is contained by the other node", t => {
  t.equal(compareDocumentPosition(em, span, context), 10);
});
