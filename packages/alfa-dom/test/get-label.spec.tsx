import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getLabel } from "../src/get-label";

test("getLabel() gets the label of a labelable element", t => {
  const input = <input id="foo" />;
  const label = <label for="foo">Bar</label>;
  const form = (
    <form>
      {label}
      {input}
    </form>
  );

  t.deepEqual(getLabel(input, form), Some.of(label));
});

test("getLabel() returns none when no label exists", t => {
  const input = <input id="foo" />;
  const form = <form>{input}</form>;

  t.equal(getLabel(input, form), None);
});

test("getLabel() returns none when an element is not labelable", t => {
  const div = <div id="foo" />;
  const form = (
    <form>
      <label for="foo">Bar</label>;{div}
    </form>
  );

  t.equal(getLabel(div, form), None);
});

test("getLabel() returns none when an element is not the target of its label", t => {
  const input = <input id="foo" />;
  const button = <input id="foo" />;
  const label = <label for="foo">Foo</label>;
  const form = (
    <form>
      {label}
      {button}
      {input}
    </form>
  );

  t.equal(getLabel(input, form), None);
});
