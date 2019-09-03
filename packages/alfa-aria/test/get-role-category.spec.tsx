import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getRoleCategory } from "../src/get-role-category";
import { Category } from "../src/types";

const device = getDefaultDevice();

test("Returns the semantic role category of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;
  t.equal(getRoleCategory(button, button, device), Category.Widget);
});

test("Returns the semantic role category of an element when implicitly set", t => {
  const button = <button>Button</button>;
  t.equal(getRoleCategory(button, button, device), Category.Widget);
});
