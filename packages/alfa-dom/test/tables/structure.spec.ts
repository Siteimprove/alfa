import {test} from "@siteimprove/alfa-test";

import {Cell, ColGroup, isCoveredBy, RowGroup, Slot} from "../../src/tables/structure";

function slot(x: number, y: number): Slot {
  return {x: x, y: y, elements: []}
}

function cell(x: number, y: number, w: number, h: number): Cell {
  return {kind: "data", anchor: {x: x, y: y}, width: w, height: h}
}

function rowGroup(y: number, h: number): RowGroup {
  return {anchor: {y: y}, height: h}
}

function colGroup(x: number, w: number): ColGroup {
  return {anchor: {x: x}, width: w}
}

test("isCoveredBy works as expected", t => {
    t.equal(isCoveredBy(slot(2, 6), cell(2, 6, 1, 1)), true);
    t.equal(isCoveredBy(slot(2, 6), cell(2, 6, 4, 2)), true);
    t.equal(isCoveredBy(slot(4, 7), cell(2, 6, 4, 2)), true);
    t.equal(isCoveredBy(slot(1, 6), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(2, 4), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(4, 6), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(2, 9), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(5, 7), cell(2, 6, 4, 2)), true);
    t.equal(isCoveredBy(slot(6, 7), cell(2, 6, 4, 2)), false);
    t.equal(isCoveredBy(slot(5, 8), cell(2, 6, 4, 2)), false);
  }
);
