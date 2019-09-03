import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getNextSibling } from "../src/get-next-sibling";

test("Returns null when no next sibling exists", t => {
  const button = <button />;
  const div = <div>{button}</div>;
  t.equal(getNextSibling(button, div), null);
});

test("Returns null when no parent exists", t => {
  const button = <button />;
  const div = <div />;
  t.equal(getNextSibling(button, div), null);
});

test("Returns next sibling when it is defined", t => {
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
