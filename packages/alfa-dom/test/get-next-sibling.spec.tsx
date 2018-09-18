import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getNextSibling } from "../src/get-next-sibling";

test("getNextSibling returns null when no next sibling exists", t => {
  const button = <button />;
  const div = <div>{button}</div>;
  t.equal(getNextSibling(button, div), null);
});

test("getNextSibling returns null when no parent exists", t => {
  const button = <button />;
  const div = <div />;
  t.equal(getNextSibling(button, div), null);
});

test("getNextSibling returns next sibling when it is defined", t => {
  const button = <button />;
  const p = <p>Foo</p>;
  const div = (
    <div>
      {button}
      {p}
    </div>
  );
  t.equal(getNextSibling(button, div), p);
});
