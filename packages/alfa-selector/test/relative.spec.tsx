import { test } from "@siteimprove/alfa-test";

import { Selector } from "../src/index.js";
import { Relative } from "../src/selector/relative.js";

import { parse, serialize } from "./parser.js";

const parser = Relative.parse(Selector.parseSelector);

test(".parse() parses relative selectors with explicit combinator", (t) => {
  for (const combinator of [">", "+", "~"]) {
    t.deepEqual(serialize(`${combinator} .foo`, parser), {
      type: "relative",
      combinator,
      selector: {
        type: "class",
        name: "foo",
        key: ".foo",
        specificity: { a: 0, b: 1, c: 0 },
      },
      specificity: { a: 0, b: 1, c: 0 },
    });
  }
});

test("parses relative selectors with implicit combinator", (t) => {
  t.deepEqual(serialize(".foo", parser), {
    type: "relative",
    combinator: " ",
    selector: {
      type: "class",
      name: "foo",
      key: ".foo",
      specificity: { a: 0, b: 1, c: 0 },
    },
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test("Loose selectors don't match anything", (t) => {
  const a = <span></span>;
  const b = <div></div>;
  <div>
    {a}
    {b}
  </div>;

  for (const selector of ["div", "span", "> span", "+ div", "~ div"]) {
    const relative = parse(selector, parser);

    t(!relative.matches(a), `Selector "${selector}" should not match <span>`);
    t(!relative.matches(b), `Selector "${selector}" should not match <div>`);
  }
});

test("Anchored descendant selectors match correctly", (t) => {
  const a = <span></span>;
  const b = <div></div>;
  const c = <span></span>;
  const inner = <div>{c}</div>;
  const parent = (
    <div>
      {a}
      {b}
      {inner}
    </div>
  );

  const loose = parse("span", parser);

  t(loose.anchoredAt(parent).matches(a));
  t(!loose.anchoredAt(parent).matches(b));
  t(loose.anchoredAt(parent).matches(c));

  t(!loose.anchoredAt(inner).matches(a));
  t(!loose.anchoredAt(inner).matches(b));
  t(loose.anchoredAt(inner).matches(c));
});

test("Anchored direct descendant selectors match correctly", (t) => {
  const a = <span></span>;
  const b = <div></div>;
  const c = <span></span>;
  const inner = <div>{c}</div>;
  const parent = (
    <div>
      {a}
      {b}
      {inner}
    </div>
  );

  const loose = parse("> span", parser);

  t(loose.anchoredAt(parent).matches(a));
  t(!loose.anchoredAt(parent).matches(b));
  t(!loose.anchoredAt(parent).matches(c));

  t(!loose.anchoredAt(inner).matches(a));
  t(!loose.anchoredAt(inner).matches(b));
  t(loose.anchoredAt(inner).matches(c));
});

test("Anchored sibling selectors match correctly", (t) => {
  const first = <span></span>;
  const a = <span></span>;
  const later = <div></div>;
  const c = <span></span>;

  <div>
    {first}
    {a}
    {later}
    {c}
  </div>;

  const loose = parse("~ span", parser);

  t(loose.anchoredAt(first).matches(a));
  t(!loose.anchoredAt(first).matches(later));
  t(loose.anchoredAt(first).matches(c));

  t(!loose.anchoredAt(later).matches(a));
  t(!loose.anchoredAt(later).matches(later));
  t(loose.anchoredAt(later).matches(c));
});

test("Anchored direct sibling selectors match correctly", (t) => {
  const first = <span></span>;
  const a = <span></span>;
  const later = <div></div>;
  const c = <span></span>;

  <div>
    {first}
    {a}
    {later}
    {c}
  </div>;

  const loose = parse("+ span", parser);

  t(loose.anchoredAt(first).matches(a));
  t(!loose.anchoredAt(first).matches(later));
  t(!loose.anchoredAt(first).matches(c));

  t(!loose.anchoredAt(later).matches(a));
  t(!loose.anchoredAt(later).matches(later));
  t(loose.anchoredAt(later).matches(c));
});
