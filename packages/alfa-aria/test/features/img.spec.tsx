import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Img } from "../../src/features/img";
import { Except } from "../../src/types";

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */
test("Returns the semantic role of an image with a non-empty string alt attribute", t => {
  const img = <img alt="Foobar" />;
  t.equal(Img.role!(img, img), Roles.Img, "Image role is not Img");
});

test("Returns null if an image has the alt attribute set to the empty-string", t => {
  const img = <img alt="" />;
  t.equal(Img.role!(img, img), null, "Image role is not null");
});

test("Returns no role if an image does not have an alt attribute", t => {
  const img = <img alt="" />;
  t.equal(Img.role!(img, img), null, "Image role is not null");
});

test("Returns the allowed roles of an image with an alt attribute set to the empty string", t => {
  const img = <img alt="" />;
  t.deepEqual(
    Img.allowedRoles(img, img),
    [Roles.None, Roles.Presentation],
    "Image allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an image with a non-empty string alt attribute", t => {
  const img = <img alt="Foobar" />;
  t.deepEqual(
    Img.allowedRoles(img, img),
    Except(Roles, [Roles.Presentation, Roles.None]),
    "Image allowed roles are incorrect"
  );
});
