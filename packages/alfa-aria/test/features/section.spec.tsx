import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

test("Returns the semantic role of a section that has an accessible name", t => {
  const section = <section>Foo</section>;
  t.equal(getRole(section, section), Roles.Region);
});
