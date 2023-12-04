import { test } from "@siteimprove/alfa-test";
import { parse, serialize } from "./parser";

test(".parse() parses an :nth-child selector", (t) => {
  t.deepEqual(serialize(":nth-child(odd)"), {
    type: "pseudo-class",
    name: "nth-child",
    index: {
      step: 2,
      offset: 1,
    },
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() accepts the `of selector` syntax", (t) => {
  t.deepEqual(serialize(":nth-child(odd of div)"), {
    type: "pseudo-class",
    name: "nth-child",
    index: {
      step: 2,
      offset: 1,
    },
    selector: {
      type: "type",
      namespace: null,
      name: "div",
      specificity: { a: 0, b: 0, c: 1 },
    },
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test("#matches() checks if an element matches an :nth-child selector", (t) => {
  const selector = parse(":nth-child(odd)");

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    Hello
    {b}
    {c}
    {d}
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(c), true);
  t.equal(selector.matches(d), false);
});

test("#matches() checks if an element matches an :nth-last-child selector", (t) => {
  const selector = parse(":nth-last-child(odd)");

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    Hello
    {b}
    {c}
    {d}
  </div>;

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
  t.equal(selector.matches(c), false);
  t.equal(selector.matches(d), true);
});
