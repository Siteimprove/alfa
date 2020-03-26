import { Map } from "@siteimprove/alfa-map";
import { test } from "@siteimprove/alfa-test";
import { None, Some } from "@siteimprove/alfa-option";

import { Attribute, Element } from "../../src";
import { Cell, ColGroup, RowGroup } from "../../src/tables/groups";
import { parseEnumeratedAttribute, parseSpan } from "../../src/tables/helpers";

const dummy = Element.of(None, None, "foo");

function cell(x: number, y: number, w: number, h: number): Cell {
  return Cell.of("data", x, y, w, h, dummy);
}

function rowGroup(y: number, h: number): RowGroup {
  return RowGroup.of(y, h, dummy);
}

function colGroup(x: number, w: number): ColGroup {
  return ColGroup.of(x, w, dummy);
}

test("isCovering ̤correctly computes cell coverage", (t) => {
  // in small cell
  t.equal(cell(2, 6, 1, 1).isCovering(2, 6), true);

  // out of small cell (left, right, above, below)
  t.equal(cell(2, 6, 1, 1).isCovering(1, 6), false);
  t.equal(cell(2, 6, 1, 1).isCovering(4, 6), false);
  t.equal(cell(2, 6, 1, 1).isCovering(2, 4), false);
  t.equal(cell(2, 6, 1, 1).isCovering(2, 9), false);

  // in/out big cell, just at the limit
  t.equal(cell(2, 6, 4, 2).isCovering(5, 7), true);
  t.equal(cell(2, 6, 4, 2).isCovering(6, 7), false);
  t.equal(cell(2, 6, 4, 2).isCovering(5, 8), false);
});

test("isCovering ̤correctly computes group coverage", (t) => {
  // in small groups
  t.equal(rowGroup(6, 1).isCovering(2, 6), true);
  t.equal(colGroup(2, 1).isCovering(2, 6), true);

  // out of small groups (left, right, above, below)
  t.equal(colGroup(2, 1).isCovering(1, 6), false);
  t.equal(colGroup(2, 1).isCovering(4, 6), false);
  t.equal(rowGroup(6, 1).isCovering(2, 4), false);
  t.equal(rowGroup(6, 1).isCovering(2, 9), false);

  // in/out big groups, just at the limit
  t.equal(colGroup(2, 4).isCovering(5, 7), true);
  t.equal(colGroup(2, 4).isCovering(6, 7), false);
  t.equal(rowGroup(6, 2).isCovering(5, 7), true);
  t.equal(rowGroup(6, 2).isCovering(5, 8), false);
});

test("parse span attribute according to specs", (t) => {
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

test("parse enumerated attribute according to specs", (t) => {
  function enumerated(value: string): Element {
    return Element.of(None, None, "dummy", (elt) => [
      Attribute.of(None, None, "enumerated", value),
    ]);
  }
  const noenum = Element.of(None, None, "dummy");
  const noDefault = Map.from([
    ["foo", 1],
    ["bar", 2],
  ]);
  const withDefault = Map.from([
    ["foo", 1],
    ["bar", 2],
    ["missing", 0],
    ["invalid", 42],
  ]);

  const parserNoDefault = parseEnumeratedAttribute("enumerated", noDefault);
  const parserWithDefault = parseEnumeratedAttribute("enumerated", withDefault);

  t.deepEqual(parserNoDefault(enumerated("Foo")), Some.of(1));
  t.deepEqual(parserNoDefault(enumerated("invalid")), None);
  t.deepEqual(parserNoDefault(noenum), None);

  t.deepEqual(parserWithDefault(enumerated("bAR")), Some.of(2));
  t.deepEqual(parserWithDefault(enumerated("invalid")), Some.of(42));
  t.deepEqual(parserWithDefault(noenum), Some.of(0));
});
