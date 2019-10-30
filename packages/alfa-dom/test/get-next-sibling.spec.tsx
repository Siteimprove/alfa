import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getNextSibling } from "../src/get-next-sibling";
import { Node } from "../src/types";

test("getNextSibling() gets the next sibling of a node", t => {
  const button = <button />;
  const p = <p>Foo</p>;
  const div = (
    <div>
      {button}
      {p}
    </div>
  );

  t.deepEqual(getNextSibling(button, div), Some.of<Node>(p));
});

test("getNextSibling() returns none when no next sibling exists", t => {
  const button = <button />;
  const div = <div>{button}</div>;

  t.equal(getNextSibling(button, div), None);
});

test("getNextSibling() returns none when no parent exists", t => {
  const button = <button />;
  const div = <div />;

  t.equal(getNextSibling(button, div), None);
});
