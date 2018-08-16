import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getId } from "../src/get-id";

test("Retrieves the ID of an element", t => {
  const foo = <div id="bar" />;
  t.equal(getId(foo), "bar");
});

test("Retrieves the ID of an element that has no ID", t => {
  const foo = <p>Foo</p>;
  t.equal(getId(foo), null);
});
