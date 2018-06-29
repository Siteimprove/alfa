import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

test("Returns the semantic role of a form that has an accessible name", t => {
  const form = <form>Foo</form>;
  t.equal(getRole(form, form), Roles.Form);
});
