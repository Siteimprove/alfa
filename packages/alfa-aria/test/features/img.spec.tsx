import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */
test("Returns the semantic role of an image with a non-empty string alt attribute", t => {
  const img = <img alt="Foobar" />;
  t.equal(getRole(img, img), Roles.Img);
});

test("Returns null if an image has the alt attribute set to the empty-string", t => {
  const img = <img alt="" />;
  t.equal(getRole(img, img), null);
});

test("Returns null if an image does not have an alt attribute", t => {
  const img = <img alt="" />;
  t.equal(getRole(img, img), null);
});
