import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getPreviousSibling } from "../src/get-previous-sibling";

test("Returns null when no previous sibling exists", t => {
  const button = <button />;
  const div = <div>{button}</div>;
  t.equal(getPreviousSibling(button, div), null);
});

test("Returns null when no parent exists", t => {
  const button = <button />;
  const div = <div />;
  t.equal(getPreviousSibling(button, div), null);
});

test("Returns previous defined sibling", t => {
  const button = <button />;
  const p = <p>Foo</p>;
  const div = (
    <div>
      {p}
      {button}
    </div>
  );
  t.equal(getPreviousSibling(button, div), p);
});
