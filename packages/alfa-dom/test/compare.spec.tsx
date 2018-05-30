import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import { compare } from "../src/compare";

const foo = <em />;
const bar = <strong />;

const context = (
  <div>
    <span>{foo}</span>
    {bar}
  </div>
);

test("Returns 0 when a node is compared to itself", t => {
  t.is(compare(foo, foo, context), 0);
});

test("Returns -1 when the first node comes before the second", t => {
  t.is(compare(foo, bar, context), -1);
});

test("Returns 1 when the first node comes after the second", t => {
  t.is(compare(bar, foo, context), 1);
});
