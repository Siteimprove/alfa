import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Select } from "../../src/features/select";
import { None } from "../../src/types";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */

test("Returns the semantic role of a select with no multiple attribute and no size attribute with value greater than 1", t => {
  const select = <select />;
  t.equal(
    Select.role!(select, select),
    Roles.Combobox,
    "Select role is not Combobox"
  );
});

test("Returns the semantic role of a select with a multiple attribute", t => {
  const select = <select multiple />;
  t.equal(
    Select.role!(select, select),
    Roles.ListBox,
    "Select role is not ListBox"
  );
});

test("Returns the semantic role of a select with a size attribute with greater value than 1", t => {
  const select = <select size="2" />;
  t.equal(
    Select.role!(select, select),
    Roles.ListBox,
    "Select role is not ListBox"
  );
});

test("Returns the allowed roles of a select with no multiple attribute and no size attribute with value greater than 1", t => {
  const select = <select />;
  t.deepEqual(
    Select.allowedRoles(select, select),
    [Roles.Menu],
    "Incorrect allowed roles"
  );
});

test("Returns the allowed roles of a select with a multiple attribute and a size attribute with value greater than 1", t => {
  const select = <select multiple size="2" />;
  t.deepEqual(
    Select.allowedRoles(select, select),
    None,
    "Incorrect allowed roles"
  );
});
