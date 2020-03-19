import {test} from "@siteimprove/alfa-test";
import {None} from "@siteimprove/alfa-option";
import {Attribute, Element, parseSpan} from "../../src";

import { Cell, ColGroup, isCovering, RowGroup } from "../../src";

const dummy = Element.of(None, None, "foo");

function cell(x: number, y: number, w: number, h: number): Cell {
  return {kind: "data", anchor: {x: x, y: y}, width: w, height: h, element: dummy}
}

function rowGroup(y: number, h: number): RowGroup {
  return {anchor: {y: y}, height: h, element: dummy}
}

function colGroup(x: number, w: number): ColGroup {
  return {anchor: {x: x}, width: w, element: dummy}
}

test("isCoveredBy ̤correctly computes cell coverage", t => {
    // in small cell
    t.equal(isCovering(2, 6)(cell(2, 6, 1, 1)), true);

    // out of small cell (left, right, above, below)
    t.equal(isCovering(1, 6)(cell(2, 6, 1, 1)), false);
    t.equal(isCovering(4, 6)(cell(2, 6, 1, 1)), false);
    t.equal(isCovering(2, 4)(cell(2, 6, 1, 1)), false);
    t.equal(isCovering(2, 9)(cell(2, 6, 1, 1)), false);

    // in/out big cell, just at the limit
    t.equal(isCovering(5, 7)(cell(2, 6, 4, 2)), true);
    t.equal(isCovering(6, 7)(cell(2, 6, 4, 2)), false);
    t.equal(isCovering(5, 8)(cell(2, 6, 4, 2)), false);
  }
);

test("isCoveredBy ̤correctly computes group coverage", t => {
    // in small groups
    t.equal(isCovering(2, 6)(rowGroup(6, 1)), true);
    t.equal(isCovering(2, 6)(colGroup(2, 1)), true);


    // out of small groups (left, right, above, below)
    t.equal(isCovering(1, 6)(colGroup(2, 1)), false);
    t.equal(isCovering(4, 6)(colGroup(2, 1)), false);
    t.equal(isCovering(2, 4)(rowGroup(6, 1)), false);
    t.equal(isCovering(2, 9)(rowGroup(6, 1)), false);

    // in/out big groups, just at the limit
    t.equal(isCovering(5, 7)(colGroup(2, 4)), true);
    t.equal(isCovering(6, 7)(colGroup(2, 4)), false);
    t.equal(isCovering(5, 7)(rowGroup(6, 2)), true);
    t.equal(isCovering(5, 8)(rowGroup(6, 2)), false);
  }
);

test("parse span attribute according to specs", t => {
  function span(name: string, value:string): Element {
    return Element.of(None, None, "foo", (elt)=> [Attribute.of(None, None, `${name}span`, value)])
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
