import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Th } from "../../src/features/th";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#th
 */

test("Returns the semantic role of an tablecell header with scope row", t => {
  const th = <th scope="row" />;
  t.equal(Th.role!(th, th), Roles.RowHeader);
});

test("Returns the semantic role of an tablecell header with scope rowgroup", t => {
  const th = <th scope="rowgroup" />;
  t.equal(Th.role!(th, th), Roles.RowHeader);
});

test("Returns the semantic role of an tablecell header with scope col", t => {
  const th = <th scope="col" />;
  t.equal(Th.role!(th, th), Roles.ColumnHeader);
});

test("Returns the semantic role of an tablecell header with scope colgroup", t => {
  const th = <th scope="colgroup" />;
  t.equal(Th.role!(th, th), Roles.ColumnHeader);
});
