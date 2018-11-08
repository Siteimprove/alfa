import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Section } from "../../src/features/section";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#section
 */

test("Returns the semantic role of a section that has an accessible name", t => {
  const section = <section title="foo" />;
  t.equal(Section.role!(section, section), Roles.Region);
});

// test("Returns no role if a section has no accessible name", t => {
//   const section = <section />;
//   t.equal(Section.role!(section, section), null);
// });
