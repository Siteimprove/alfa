import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getNextElementSibling } from "../src/get-next-element-sibling";

test("getNextElementSibling() gets the next sibling that is an element", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );

  t.deepEqual(getNextElementSibling(button, div), Some.of(span));
});

test("getNextElementSibling() returns none when no next element sibling exists", t => {
  const button = <button />;
  const div = (
    <div>
      {button}
      Hello I am not an element
    </div>
  );

  t.equal(getNextElementSibling(button, div), None);
});

test("getNextElementSibling() returns none when no parent exists", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );

  t.equal(getNextElementSibling(div, div), None);
});
