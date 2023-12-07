import { test } from "@siteimprove/alfa-test";
import { parse, serialize } from "./parser";

test(".parse() parses an :nth-[last]-child selector", (t) => {
  for (const name of ["nth-child", "nth-last-child"] as const) {
    t.deepEqual(serialize(`:${name}(odd)`), {
      type: "pseudo-class",
      name,
      index: { step: 2, offset: 1 },
      specificity: { a: 0, b: 1, c: 0 },
    });
  }
});

test(".parse() accepts the `of selector` syntax", (t) => {
  for (const name of ["nth-child", "nth-last-child"] as const) {
    t.deepEqual(serialize(`:${name}(odd of div)`), {
      type: "pseudo-class",
      name,
      index: { step: 2, offset: 1 },
      selector: {
        type: "type",
        namespace: null,
        name: "div",
        specificity: { a: 0, b: 0, c: 1 },
      },
      specificity: { a: 0, b: 1, c: 1 },
    });
  }
});

test(".parse() correctly computes the specificity of :nth-[last]-child of", (t) => {
  for (const name of ["nth-child", "nth-last-child"] as const) {
    t.deepEqual(serialize(`:${name}(even of li, .item)`).specificity, {
      a: 0,
      b: 2,
      c: 0,
    });
  }
});

const a = <p />;
const b = <p />;
const c = <p />;
const span = <span>Not a p</span>;

<div>
  {a}
  Hello
  {b}
  {span}
  {c}
</div>;

test("#matches() checks if an element matches an :nth-child selector", (t) => {
  const selector = parse(":nth-child(odd)");

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(span), true);
  t.equal(selector.matches(c), false);
});

test("#matches() checks if an element matches an :nth-child of selector", (t) => {
  const selector = parse(":nth-child(odd of p)");

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(span), false);
  t.equal(selector.matches(c), true);
});

test("#matches() checks if an element matches an :nth-last-child selector", (t) => {
  const selector = parse(":nth-last-child(odd)");

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
  t.equal(selector.matches(span), false);
  t.equal(selector.matches(c), true);
});

test("#matches() checks if an element matches an :nth-last-child of selector", (t) => {
  const selector = parse(":nth-last-child(odd of p)");

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(span), false);
  t.equal(selector.matches(c), true);
});
