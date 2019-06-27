import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Select } from "../../../src/features/html/select";
import * as Roles from "../../../src/roles";
import { None } from "../../../src/types";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */

test("Returns the semantic role of a select with no multiple attribute and no size attribute with value greater than 1", t => {
  const select = <select />;
  t.equal(Select.role!(select, select, device), Roles.Combobox);
});

test("Returns the semantic role of a select with a multiple attribute", t => {
  const select = <select multiple />;
  t.equal(Select.role!(select, select, device), Roles.ListBox);
});

test("Returns the semantic role of a select with a size attribute with greater value than 1", t => {
  const select = <select size="2" />;
  t.equal(Select.role!(select, select, device), Roles.ListBox);
});

test("Returns the allowed roles of a select with no multiple attribute and no size attribute with value greater than 1", t => {
  const select = <select />;
  t.deepEqual(Select.allowedRoles(select, select, device), [Roles.Menu]);
});

test("Returns the allowed roles of a select with a multiple attribute and a size attribute with value greater than 1", t => {
  const select = <select multiple size="2" />;
  t.deepEqual(Select.allowedRoles(select, select, device), None(Roles));
});
