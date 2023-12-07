import { test } from "@siteimprove/alfa-test";
import { Context } from "../src";

import { parse, serialize } from "./parser";

test(".parse() parses a named pseudo-class selector", (t) => {
  t.deepEqual(serialize(":hover"), {
    type: "pseudo-class",
    name: "hover",
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parses :host pseudo-class selector", (t) => {
  t.deepEqual(serialize(":host"), {
    type: "pseudo-class",
    name: "host",
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parses a functional pseudo-class selector", (t) => {
  t.deepEqual(serialize(":not(.foo)"), {
    type: "pseudo-class",
    name: "not",
    selector: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
    },
    specificity: { a: 0, b: 1, c: 0 },
  });
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

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
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

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
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

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
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

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(c), true);
  t.equal(selector.matches(d), false);
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

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
  t.equal(selector.matches(c), false);
  t.equal(selector.matches(d), true);
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

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
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

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
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

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
});

test("#matches() checks if an element matches a :hover selector", (t) => {
  const selector = parse(":hover");

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.hover(p)), true);
});

test("#matches() checks if an element matches a :hover selector when its descendant is hovered", (t) => {
  const selector = parse(":hover");

  const target = <span> Hello </span>;
  const p = <div> {target} </div>;

  t.equal(selector.matches(p, Context.hover(target)), true);
});

test("#matches() checks if an element matches an :active selector", (t) => {
  const selector = parse(":active");

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.active(p)), true);
});

test("#matches() checks if an element matches a :focus selector", (t) => {
  const selector = parse(":focus");

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.focus(p)), true);
});

test("#matches() checks if an element matches a :focus-within selector", (t) => {
  const selector = parse(":focus-within");

  const button = <button />;
  const p = <p>{button}</p>;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.focus(p)), true);
  t.equal(selector.matches(p, Context.focus(button)), true);
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
