import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { isTabbable } from "../src/is-tabbable";

test("Returns False on Unfocusable Element", t => {
  const foo = <p>Foo</p>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar), false);
});

test("Returns False on Focusable Element with negative TabIndex ", t => {
  const foo = <button tabindex="-1">Foo</button>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar), false);
});

test("Returns True on Unfocusable Element with positive TabIndex ", t => {
  const foo = <p tabindex="5">Foo</p>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar), true);
});

test("Returns True on Focusable Element with Implicit TabIndex ", t => {
  const foo = <button>Foo</button>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar), true);
});
