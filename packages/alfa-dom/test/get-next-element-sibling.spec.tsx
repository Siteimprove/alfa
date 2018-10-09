import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getNextElementSibling } from "../src/get-next-element-sibling";

test("Return next sibling that is an element", t => {
  const button = <button />;
  const span = <span />;
  const div = (
    <div>
      {button}
      Hello I am not an element
      {span}
    </div>
  );
  t.equal(getNextElementSibling(button, div), span);
});

test("Return null when no next element sibling exists", t => {
  const button = <button />;
  const div = (
    <div>
      {button}
      Hello I am not an element
    </div>
  );
  t.equal(getNextElementSibling(button, div), null);
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
  t.equal(getNextElementSibling(div, div), null);
});
