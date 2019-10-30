import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

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

test("getChildNodes() gets the direct child nodes of an element", t => {
  t.deepEqual([...getChildNodes(baz, <div>{baz}</div>)], [foo]);
});

test("getChildNodes() gets the composed child nodes of an element", t => {
  t.deepEqual(
    [...getChildNodes(baz, <div>{baz}</div>, { composed: true })],
    [baz.shadowRoot!, foo]
  );
});

test("getChildNodes() gets the flattened child nodes of an element", t => {
  t.deepEqual(
    [...getChildNodes(baz, <div>{baz}</div>, { flattened: true })],
    [foo, bar]
  );
});
