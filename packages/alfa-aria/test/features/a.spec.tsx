import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { A } from "../../src/features/a";
import * as Roles from "../../src/roles";
import { Any } from "../../src/types";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */

test("Returns the semantic role of an anchor that has an href attribute", t => {
  const a = <a href="foo">Foo</a>;
  t.equal(A.role!(a, a), Roles.Link);
});

test("Returns no role when an anchor has no href attribute", t => {
  const a = <a>Foo</a>;
  t.equal(A.role!(a, a), null, "Anchor role is not null");
});

test("Returns the allowed roles of an anchor that has an href attribute", t => {
  const a = <a href="foo">Foo</a>;
  const actual = A.allowedRoles(a, a);
  const expected = [
    Roles.Button,
    Roles.Checkbox,
    Roles.MenuItem,
    Roles.MenuItemCheckbox,
    Roles.MenuItemRadio,
    Roles.Option,
    Roles.Radio,
    Roles.Switch,
    Roles.Tab,
    Roles.TreeItem
  ];
  t.deepEqual(actual, expected);
});

test("Returns all roles if an anchor has no href attribute", t => {
  const a = <a>Foo</a>;
  t.deepEqual(A.allowedRoles(a, a), Any(Roles));
});
