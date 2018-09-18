import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getLabel } from "../src/get-label";

test("getLabel returns label when element is labelable and label is defined", t => {
  const input = <input id="foo" />;
  const label = <label for="foo">Bar</label>;
  const form = (
    <form>
      {label}
      {input}
    </form>
  );
  t.equal(getLabel(input, form), label);
});

test("getLabel returns null when no label is defined", t => {
  const input = <input id="foo" />;
  const form = <form>{input}</form>;
  t.equal(getLabel(input, form), null);
});

test("getLabel returns null when element is not labelable", t => {
  const div = <div id="foo" />;
  const form = <form>{div}</form>;
  t.equal(getLabel(div, form), null);
});
