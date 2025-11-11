import { test } from "@siteimprove/alfa-test";

import { Context } from "../dist/index.js";

import { parse, parseErr, serialize } from "./parser.js";

test(".parse() parses a named pseudo-class selector", (t) => {
  t.deepEqual(serialize(":hover"), {
    type: "pseudo-class",
    name: "hover",
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parses :host non-functional pseudo-class selector", (t) => {
  t.deepEqual(serialize(":host"), {
    type: "pseudo-class",
    name: "host",
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parses :host functional pseudo-class selector", (t) => {
  t.deepEqual(serialize(":host(div)"), {
    type: "pseudo-class",
    name: "host",
    selector: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    specificity: { a: 0, b: 1, c: 1 },
  });
});

test(".parse() doesn't parse :host with an invalid selector", (t) => {
  t(parseErr(":host(div span").isErr());
  t(parseErr(":host(::after").isErr());
  // t(parseErr(":host(div::after").isErr());
});

test(".parse() parses a functional pseudo-class selector", (t) => {
  t.deepEqual(serialize(":not(.foo)"), {
    type: "pseudo-class",
    name: "not",
    selector: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parsers :is and :where as forgiving lists", (t) => {
  for (const sel of ["is", "where"] as const) {
    for (const list of [
      ".foo, #bar",
      ".foo, #bar, ###",
      "###, .foo, #bar",
      "###, .foo, $$$, #bar",
    ]) {
      t.deepEqual(serialize(`:${sel}(${list})`), {
        type: "pseudo-class",
        name: sel,
        selector: {
          type: "list",
          selectors: [
            {
              type: "class",
              name: "foo",
              specificity: { a: 0, b: 1, c: 0 },
              key: ".foo",
            },
            {
              type: "id",
              name: "bar",
              specificity: { a: 1, b: 0, c: 0 },
              key: "#bar",
            },
          ],
          specificity: { a: 1, b: 0, c: 0 },
        },
        specificity: sel === "is" ? { a: 1, b: 0, c: 0 } : { a: 0, b: 0, c: 0 },
      });
    }
  }
});

test("#matches() checks if an element matches a :first-child selector", (t) => {
  const selector = parse(":first-child");

  const a = <p />;
  const b = <p />;

  <div>
    Hello
    {a}
    {b}
  </div>;

  t(selector.matches(a));
  t(!selector.matches(b));
});

test("#matches() checks if an element matches a :last-child selector", (t) => {
  const selector = parse(":last-child");

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    {b}
    Hello
  </div>;

  t(!selector.matches(a));
  t(selector.matches(b));
});

test("#matches() checks if an element matches an :only-child selector", (t) => {
  const selector = parse(":only-child");

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    Hello
  </div>;

  <div>
    {b}
    <p />
    Hello
  </div>;

  t(selector.matches(a));
  t(!selector.matches(b));
});

test("#matches() checks if an element matches an :nth-of-type selector", (t) => {
  const selector = parse(":nth-of-type(odd)");

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    <div />
    {a}
    Hello
    <span />
    {b}
    {c}
    {d}
  </div>;

  t(selector.matches(a));
  t(!selector.matches(b));
  t(selector.matches(c));
  t(!selector.matches(d));
});

test("#matches() checks if an element matches an :nth-last-of-type selector", (t) => {
  const selector = parse(":nth-last-of-type(odd)");

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    {b}
    {c}
    <div />
    {d}
    Hello
    <span />
  </div>;

  t(!selector.matches(a));
  t(selector.matches(b));
  t(!selector.matches(c));
  t(selector.matches(d));
});

test("#matches() checks if an element matches a :first-of-type selector", (t) => {
  const selector = parse(":first-of-type");

  const a = <p />;
  const b = <p />;

  <div>
    <div />
    Hello
    {a}
    {b}
  </div>;

  t(selector.matches(a));
  t(!selector.matches(b));
});

test("#matches() checks if an element matches a :last-of-type selector", (t) => {
  const selector = parse(":last-of-type");

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    {b}
    Hello
    <div />
  </div>;

  t(!selector.matches(a));
  t(selector.matches(b));
});

test("#matches() checks if an element matches a :only-of-type selector", (t) => {
  const selector = parse(":only-of-type");

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    Hello
    <div />
  </div>;

  <div>
    {b}
    <p />
    Hello
    <div />
  </div>;

  t(selector.matches(a));
  t(!selector.matches(b));
});

test("#matches() checks if an element matches a :hover selector", (t) => {
  const selector = parse(":hover");

  const p = <p />;

  t(!selector.matches(p));
  t(selector.matches(p, Context.hover(p)));
});

test("#matches() checks if an element matches a :hover selector when its descendant is hovered", (t) => {
  const selector = parse(":hover");

  const target = <span> Hello </span>;
  const p = <div> {target} </div>;

  t(selector.matches(p, Context.hover(target)));
});

test("#matches() checks if an element matches an :active selector", (t) => {
  const selector = parse(":active");

  const p = <p />;

  t(!selector.matches(p));
  t(selector.matches(p, Context.active(p)));
});

test("#matches() checks if an element matches a :focus selector", (t) => {
  const selector = parse(":focus");

  const p = <p />;

  t(!selector.matches(p));
  t(selector.matches(p, Context.focus(p)));
});

test("#matches() checks if an element matches a :focus-within selector", (t) => {
  const selector = parse(":focus-within");

  const button = <button />;
  const p = <p>{button}</p>;

  t(!selector.matches(p));
  t(selector.matches(p, Context.focus(p)));
  t(selector.matches(p, Context.focus(button)));
});

test("#matches() checks if an element matches a :link selector", (t) => {
  const selector = parse(":link");

  // These elements are links
  for (const element of [
    <a href="#" />,
    <area href="#" />,
    <link href="#" />,
  ]) {
    t.equal(selector.matches(element), true, element.toString());

    // Only non-visited links match :link
    t.equal(
      selector.matches(element, Context.visit(element)),
      false,
      element.toString(),
    );
  }

  // These elements aren't links
  for (const element of [<a />, <p />]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});

test("#matches() checks if an element matches a :visited selector", (t) => {
  const selector = parse(":visited");

  // These elements are links
  for (const element of [
    <a href="#" />,
    <area href="#" />,
    <link href="#" />,
  ]) {
    t.equal(
      selector.matches(element, Context.visit(element)),
      true,
      element.toString(),
    );

    // Only visited links match :link
    t.equal(selector.matches(element), false, element.toString());
  }

  // These elements aren't links
  for (const element of [<a />, <p />]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});

test("#matches() checks if an element matches a :any-link selector", (t) => {
  const selector = parse(":any-link");

  // These elements are links
  for (const element of [
    <a href="#" />,
    <area href="#" />,
    <link href="#" />,
  ]) {
    // Matches both visited and non-visited links
    t.equal(
      selector.matches(element, Context.visit(element)),
      true,
      element.toString(),
    );

    t.equal(selector.matches(element), true, element.toString());
  }

  // These elements aren't links
  for (const element of [<a />, <p />]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});

test("#matches() checks if an element matches a :checked selector", (t) => {
  const selector = parse(":checked");

  for (const element of [
    <input type="checkbox" checked />,
    <input type="radio" checked />,
    <option selected />,
  ]) {
    t.equal(selector.matches(element), true, element.toString());
  }

  for (const element of [
    <input type="checkbox" />,
    <input type="radio" />,
    <input />,
    <option />,
  ]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});
