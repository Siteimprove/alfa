import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { A } from "../../../src/features/svg/a";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
test("Returns the semantic role of an anchor that has an href attribute", t => {
  const a = <a href="foo">Foo</a>;
  t.equal(A.role!(a, a, device), Roles.Link);
});

test("Returns the semantic role of an anchor that has no href attribute and is a descendant of text", t => {
  const a = <a />;
  const text = <text>{a}</text>;
  t.equal(A.role!(a, text, device), Roles.Group);
});

test("Returns no role when an anchor has no href attribute and is not a descendant of text", t => {
  const a = <a>Foo</a>;
  t.equal(A.role!(a, a, device), null);
});
