import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getId } from "../src/get-id";

test("Retrieves the ID of an element", t => {
  t.equal(getId(<div id="bar" />), "bar");
});

test("Retrieves the ID of an element that has no ID", t => {
  t.equal(getId(<p>Foo</p>), null);
});
