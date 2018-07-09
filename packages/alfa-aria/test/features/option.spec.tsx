import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Option } from "../../src/features/option";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#option
 */

test("Returns the semantic role of an option that is a descendant of a select", t => {
  const option = <option />;
  const select = <select>{option}</select>;
  t.equal(
    Option.role!(option, select),
    Roles.Option,
    "Option role is not Option"
  );
});

test("Returns the semantic role of an option that is a descendant of a optgroup", t => {
  const option = <option />;
  const optgroup = <optgroup>{option}</optgroup>;
  t.equal(
    Option.role!(option, optgroup),
    Roles.Option,
    "Option role is not Option"
  );
});

test("Returns the semantic role of an option that is a descendant of a datalist", t => {
  const option = <option />;
  const datalist = <datalist>{option}</datalist>;
  t.equal(
    Option.role!(option, datalist),
    Roles.Option,
    "Option role is not Option"
  );
});
