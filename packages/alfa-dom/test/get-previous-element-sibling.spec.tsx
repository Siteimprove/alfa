import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getPreviousElementSibling } from "../src/get-previous-element-sibling";

test("getPreviousElementSibling() gets the previous element sibling of an element", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );

  t.deepEqual(getPreviousElementSibling(span, div), Some.of(button));
});

test("getPreviousElementSibling() returns none when no previous element sibling exists", t => {
  const button = <button />;
  const div = (
    <div>
      Hello I am not an element
      {button}
    </div>
  );

  t.equal(getPreviousElementSibling(button, div), None);
});

test("getPreviousElementSibling returns none when no parent exists", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );

  t.equal(getPreviousElementSibling(div, div), None);
});
