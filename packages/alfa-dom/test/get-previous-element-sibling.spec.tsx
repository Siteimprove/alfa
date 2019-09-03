import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getPreviousElementSibling } from "../src/get-previous-element-sibling";

test("Return previous sibling that is an element", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );
  t.equal(getPreviousElementSibling(span, div), button);
});

test("Return null when no previous element sibling exists", t => {
  const button = <button />;
  const div = (
    <div>
      Hello I am not an element
      {button}
    </div>
  );
  t.equal(getPreviousElementSibling(button, div), null);
});

test("Return null when parent is null", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );
  t.equal(getPreviousElementSibling(div, div), null);
});
