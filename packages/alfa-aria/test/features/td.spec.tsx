import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Td } from "../../src/features/td";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tablecell
 */

test("Returns the semantic role of a tablecell that is a descendant of table", t => {
  const td = <td />;
  const table = <table>{td}</table>;
  t.equal(Td.role!(td, table), Roles.Cell);
});

test("Returns no role if a tablecell is not a descendant of a table", t => {
  const td = <td />;
  t.equal(Td.role!(td, td), null);
});
