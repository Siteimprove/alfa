import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { Form } from "../../../src/features/html/form";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */

test("Returns the semantic role of a form that has an accessible name", t => {
  const form = <form title="foo">Foo</form>;
  t.equal(Form.role!(form, form, device), Roles.Form);
});

// test("Returns no role when a form has no accessible name", t => {
//   const form = <form />;
//   t.equal(Form.role!(form, form), null);
// });
