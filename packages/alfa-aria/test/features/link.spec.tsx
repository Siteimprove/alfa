import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Link } from "../../src/features/link";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#link
 */

test("Returns the semantic role of a link with a href attribute", t => {
  const link = <link href="Foobar" />;
  t.equal(Link.role!(link, link), Roles.Link, "Link role is not Link");
});

test("Returns no role if a link has no href attribute", t => {
  const link = <link />;
  t.equal(Link.role!(link, link), null, "Link role is not null");
});
