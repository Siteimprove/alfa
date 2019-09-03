import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { Img } from "../../../src/features/html/img";
import * as Roles from "../../../src/roles";
import { Except } from "../../../src/types";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#img
 */

test("Returns the semantic role of an image with a non-empty string alt attribute", t => {
  const img = <img alt="Foobar" />;
  t.equal(Img.role!(img, img, device), Roles.Img);
});

test("Returns no role if an image has the alt attribute set to the empty-string", t => {
  const img = <img alt="" />;
  t.equal(Img.role!(img, img, device), null);
});

test("Returns no role if an image does not have an alt attribute", t => {
  const img = <img alt="" />;
  t.equal(Img.role!(img, img, device), null);
});

test("Returns the allowed roles of an image with an alt attribute set to the empty string", t => {
  const img = <img alt="" />;
  t.deepEqual(Img.allowedRoles(img, img, device), [
    Roles.None,
    Roles.Presentation
  ]);
});

test("Returns the allowed roles of an image with a non-empty string alt attribute", t => {
  const img = <img alt="Foobar" />;
  t.deepEqual(
    Img.allowedRoles(img, img, device),
    Except(Roles, [Roles.Presentation, Roles.None])
  );
});
