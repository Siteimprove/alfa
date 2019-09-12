/*import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-dom/jsx";*/
import { test } from "@siteimprove/alfa-test";

import { parsePropertiesList } from "../../src/sia-r47/rule";

test("Parses comma and semi-colon separated name=value list", t => {
  const actual = parsePropertiesList(
    "prop1=1, ignored; , prop2= ==2; prop3 ignored=3, ignored",
    [" "],
    [",", ";"],
    ["="]
  );
  const expected = new Map<String, string>();
  expected.set("prop1", "1");
  expected.set("prop1", "2");
  expected.set("prop1", "3");

  t.deepEqual(actual, expected, "Maps should be the same");
});

/*test("Passes when all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="bar" />;
  const document = documentFromNodes([span, div]);

  outcome(t, SIA_R3, { document }, { passed: [span, div] });
});

test("Fails when not all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="foo" />;
  const document = documentFromNodes([span, div]);

  outcome(t, SIA_R3, { document }, { failed: [span, div] });
});

test("Is inapplicable when no id attributes are present", t => {
  const span = <span class="foo" />;
  const document = documentFromNodes([span]);

  outcome(t, SIA_R3, { document }, Outcome.Inapplicable);
});
*/
