import {None} from "@siteimprove/alfa-option";
import {test} from "@siteimprove/alfa-test";

import {Cell, ColGroup, isCoveredBy, RowGroup, Slot} from "../../src/tables/structure";

function slot(x: number, y: number): Slot {
  return {x: x, y: y, elements: [], cell: None}
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

test("isCoveredBy ̤correctly computes cell coverage", t => {
    // in small cell
    t.equal(isCoveredBy(slot(2, 6), cell(2, 6, 1, 1)), true);

    // out of small cell (left, right, above, below)
    t.equal(isCoveredBy(slot(1, 6), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(4, 6), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(2, 4), cell(2, 6, 1, 1)), false);
    t.equal(isCoveredBy(slot(2, 9), cell(2, 6, 1, 1)), false);

    // in/out big cell, just at the limit
    t.equal(isCoveredBy(slot(5, 7), cell(2, 6, 4, 2)), true);
    t.equal(isCoveredBy(slot(6, 7), cell(2, 6, 4, 2)), false);
    t.equal(isCoveredBy(slot(5, 8), cell(2, 6, 4, 2)), false);
  }
);

test("isCoveredBy ̤correctly computes group coverage", t => {
    // in small groups
    t.equal(isCoveredBy(slot(2, 6), rowGroup(6, 1)), true);
    t.equal(isCoveredBy(slot(2, 6), colGroup(2, 1)), true);


    // out of small groups (left, right, above, below)
    t.equal(isCoveredBy(slot(1, 6), colGroup(2, 1)), false);
    t.equal(isCoveredBy(slot(4, 6), colGroup(2, 1)), false);
    t.equal(isCoveredBy(slot(2, 4), rowGroup(6, 1)), false);
    t.equal(isCoveredBy(slot(2, 9), rowGroup(6, 1)), false);

    // in/out big groups, just at the limit
    t.equal(isCoveredBy(slot(5, 7), colGroup(2, 4)), true);
    t.equal(isCoveredBy(slot(6, 7), colGroup(2, 4)), false);
    t.equal(isCoveredBy(slot(5, 7), rowGroup(6, 2)), true);
    t.equal(isCoveredBy(slot(5, 8), rowGroup(6, 2)), false);
  }
);
