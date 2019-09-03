import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getChildNodes } from "../src/get-child-nodes";

const foo = <div>Foo</div>;
const bar = <div>Bar</div>;
const baz = (
  <div>
    {foo}
    <shadow>
      <slot />
      {bar}
    </shadow>
  </div>
);

test("Gets the direct child nodes of an element", t => {
  t.deepEqual(getChildNodes(baz, <div>{baz}</div>), baz.childNodes);
});

test("Gets the composed child nodes of an element", t => {
  t.deepEqual(getChildNodes(baz, <div>{baz}</div>, { composed: true }), [
    baz.shadowRoot!,
    ...Array.from(baz.childNodes)
  ]);
});

test("Gets the flattened child nodes of an element", t => {
  t.deepEqual(getChildNodes(baz, <div>{baz}</div>, { flattened: true }), [
    foo,
    bar
  ]);
});
