import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
//import * as Roles from "../../src/roles";

test("Returns null if the footer is a descendant of an article", t => {
  const footer = <footer />;
  const article = <article>footer</article>;
  t.equal(getRole(footer, footer), null);
});
