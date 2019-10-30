import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { getDefaultDevice } from "@siteimprove/alfa-device";
import { Some } from "@siteimprove/alfa-option";
import { getRoleCategory } from "../src/get-role-category";
import { Category } from "../src/types";

const device = getDefaultDevice();

test("getRoleCategory() returns the semantic role category of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;

  t.deepEqual(getRoleCategory(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Category.Widget),
        branches: null
      }
    ]
  });
});

test("getRoelCategory() returns the semantic role category of an element when implicitly set", t => {
  const button = <button>Button</button>;

  t.deepEqual(getRoleCategory(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Category.Widget),
        branches: null
      }
    ]
  });
});
