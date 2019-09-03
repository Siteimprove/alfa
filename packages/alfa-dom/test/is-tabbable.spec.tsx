import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { isTabbable } from "../src/is-tabbable";

const device = getDefaultDevice();

test("Returns false when an element is unfocusable", t => {
  const foo = <p>Foo</p>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar, device), false);
});

test("Returns false when an element is focusable and has negative a tabindex", t => {
  const foo = <button tabindex="-1">Foo</button>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar, device), false);
});

test("Returns true when an element is unfocusable and has a positive tabindex", t => {
  const foo = <p tabindex="5">Foo</p>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar, device), true);
});

test("Returns true when an element is focusable and has an implicitly defined tabindex value", t => {
  const foo = <button>Foo</button>;
  const bar = <div>{foo}</div>;
  t.equal(isTabbable(foo, bar, device), true);
});
