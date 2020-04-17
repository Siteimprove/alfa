import { Attribute, Element } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { None } from "@siteimprove/alfa-option";

import { parseSpan } from "../src/helpers";

test("parseSpan() parses span attribute according to table specs", (t) => {
  function span(name: string, value: string): Element {
    return Element.of(None, None, "foo", (elt) => [
      Attribute.of(None, None, `${name}span`, value),
    ]);
  }
  const nospan = Element.of(None, None, "foo");

  t.equal(parseSpan(span("col", "2"), "colspan", 1, 1000, 1), 2);
  t.equal(parseSpan(span("col", "0"), "colspan", 1, 1000, 1), 1);
  t.equal(parseSpan(span("col", "2000"), "colspan", 1, 1000, 1), 1000);
  t.equal(parseSpan(span("col", ""), "colspan", 1, 1000, 1), 1);
  t.equal(parseSpan(span("col", "-2"), "colspan", 1, 1000, 1), 1);
  t.equal(parseSpan(span("col", "abc"), "colspan", 1, 1000, 1), 1);
  t.equal(parseSpan(nospan, "colspan", 1, 1000, 1), 1);

  t.equal(parseSpan(span("row", "2"), "rowspan", 0, 65534, 1), 2);
  t.equal(parseSpan(span("row", "0"), "rowspan", 0, 65534, 1), 0);
  t.equal(parseSpan(span("row", "70000"), "rowspan", 0, 65534, 1), 65534);
  t.equal(parseSpan(span("row", ""), "rowspan", 0, 65534, 1), 1);
  t.equal(parseSpan(span("row", "-2"), "rowspan", 0, 65534, 1), 1);
  t.equal(parseSpan(span("row", "abc"), "rowspan", 0, 65534, 1), 1);
  t.equal(parseSpan(nospan, "rowspan", 0, 65534, 1), 1);
});
