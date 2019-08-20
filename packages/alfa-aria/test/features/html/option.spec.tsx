import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Option } from "../../../src/features/html/option";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#option
 */

test("Returns the semantic role of an option that is a descendant of a select", t => {
  const option = <option />;
  const select = <select>{option}</select>;
  t.equal(Option.role!(option, select, device), Roles.Option);
});

test("Returns the semantic role of an option that is a descendant of a optgroup", t => {
  const option = <option />;
  const optgroup = <optgroup>{option}</optgroup>;
  t.equal(Option.role!(option, optgroup, device), Roles.Option);
});

test("Returns the semantic role of an option that is a descendant of a datalist", t => {
  const option = <option />;
  const datalist = <datalist>{option}</datalist>;
  t.equal(Option.role!(option, datalist, device), Roles.Option);
});
