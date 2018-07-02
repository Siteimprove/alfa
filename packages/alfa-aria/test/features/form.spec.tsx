import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Form } from "../../src/features/form";

test("Returns the semantic role of a form that has an accessible name", t => {
  const form = <form title="foo">Foo</form>;
  t.equal(
    Form.role!(form, form),
    Roles.Form,
    "Form does not have the role Form"
  );
});

test("Returns no role when a form has no accessible name", t => {
  const form = <form />;
  t.equal(Form.role!(form, form), null, "The role of Form is not null");
});
