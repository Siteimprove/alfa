import { Element } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";
import { Cell } from "../src/cell";

const dummy = Element.of(None, None, "foo");

function cell(x: number, y: number, w: number, h: number): Cell {
  return Cell.of(Cell.Kind.Data, x, y, w, h, dummy);
}

test("isCovering() ̤correctly computes cell coverage", (t) => {
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
