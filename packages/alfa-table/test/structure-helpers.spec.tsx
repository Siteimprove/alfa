import { Attribute, Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { None } from "@siteimprove/alfa-option";

import { Cell } from "../src/cell";
import { ColGroup } from "../src/colgroup";
import { RowGroup } from "../src/rowgroup";
import { isEmpty, parseSpan } from "../src/helpers";

const dummy = Element.of(None, None, "foo");

function cell(x: number, y: number, w: number, h: number): Cell {
  return Cell.of(Cell.Kind.Data, x, y, w, h, dummy);
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
  t.equal(rowGroup(6, 1).isCovering(6), true);
  t.equal(colGroup(2, 1).isCovering(2), true);

  // out of small groups (left, right, above, below)
  t.equal(colGroup(2, 1).isCovering(1), false);
  t.equal(colGroup(2, 1).isCovering(4), false);
  t.equal(rowGroup(6, 1).isCovering(4), false);
  t.equal(rowGroup(6, 1).isCovering(9), false);

  // in/out big groups, just at the limit
  t.equal(colGroup(2, 4).isCovering(5), true);
  t.equal(colGroup(2, 4).isCovering(6), false);
  t.equal(rowGroup(6, 2).isCovering(7), true);
  t.equal(rowGroup(6, 2).isCovering(8), false);
});

test("parse span attribute according to table specs", (t) => {
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

test("Detect empty cells (element)", (t) => {
  t(isEmpty(Element.fromElement(<td />)));
  t(!isEmpty(Element.fromElement(<td>Foo</td>))); // has text content
  t(
    !isEmpty(
      Element.fromElement(
        <td>
          <span />
        </td>
      )
    )
  ); // has child
});
