import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { Link } from "../../../src/features/html/link";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#link
 */

test("Returns the semantic role of a link with a href attribute", t => {
  const link = <link href="Foobar" />;
  t.equal(Link.role!(link, link, device), Roles.Link);
});

test("Returns no role if a link has no href attribute", t => {
  const link = <link />;
  t.equal(Link.role!(link, link, device), null);
});
