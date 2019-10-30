import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getPreviousSibling } from "../src/get-previous-sibling";
import { Node } from "../src/types";

test("getPreviousSibling() gets the previous sibling of an element", t => {
  const button = <button />;
  const p = <p>Foo</p>;
  const div = (
    <div>
      {p}
      {button}
    </div>
  );

  t.deepEqual(getPreviousSibling(button, div), Some.of<Node>(p));
});

test("getPreviousSibling() returns none when no previous sibling exists", t => {
  const button = <button />;
  const div = <div>{button}</div>;

  t.equal(getPreviousSibling(button, div), None);
});

test("getPreviousSibling() returns none when no parent exists", t => {
  const button = <button />;
  const div = <div />;

  t.equal(getPreviousSibling(button, div), None);
});
