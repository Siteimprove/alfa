import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import { compareDocumentPosition } from "../src/compare-document-position";

const foo = <em />;
const bar = <strong />;

const context = (
  <div>
    <span>{foo}</span>
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
