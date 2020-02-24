import { jsx } from "@siteimprove/alfa-dom/jsx";
import {None, Some} from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";
import {Element, Slot, global, rowProcessing, Cell, processRowGroup} from "../../src";

function makeSlot(x: number, y: number): Slot {
  return {x: x, y:y, elements: [], cell: None};
}

// JS array are row by row (first coord is row number). HTML table are col by col (x is col, y is row).
// table is transposed so that table[x][y] is indeed cell at position (x,y).
function makeSlotsArray(w: number, h: number): Array<Array<Slot>> {
  return new Array(w)
    .fill(0)
    .map((_, x) => new Array(h) // filling column n° x (JS line)
      .fill(0)
      .map((_, y) => makeSlot(x,y)) // filling cell n° x,y
  );
}

export function initTable(w: number, h: number): void {
  global.yCurrent = 0;
  global.yHeight = 0;
  global.growingCellsList = [];

  global.theTable = { slots: makeSlotsArray(w, h), width: 0, height: 0, cells: [], rowGroups: [], colGroups: []};
}


test("Process simple row", t => {
  const tr = Element.fromElement(<tr><th>1</th><td>2</td></tr>);

  initTable(4, 2);
  t.equal(global.theTable.slots[2][0].x, 2);

  rowProcessing(tr);
  t.equal(global.theTable.height, 0);
  t.equal(global.yCurrent, 1);
  t.deepEqual(global.theTable.slots[0][0].elements[0], tr.children().first().get());
  t.deepEqual(global.theTable.slots[1][0].elements[0], tr.children().rest().first().get());
});

test("Process complex row", t => {
  const tr = Element.fromElement(<tr>
    <th rowspan={2}>Grade.</th>
    <th rowspan={2}>Yield Point.</th>
    <th colspan={2}>Ultimate tensile strength</th>
    <th rowspan={2}>Per cent elong. 50.8mm or 2 in.</th>
    <th rowspan={2}>Per cent reduct. area.</th>
  </tr>);

  initTable(6, 2);

  rowProcessing(tr);
  console.dir(global.theTable, {depth: 7});

  t.deepEqual(global.theTable.cells, [
    { kind: 'header', anchor: { x: 0, y: 0 }, width: 1, height: 2 },
    { kind: 'header', anchor: { x: 1, y: 0 }, width: 1, height: 2 },
    { kind: 'header', anchor: { x: 2, y: 0 }, width: 2, height: 1 },
    { kind: 'header', anchor: { x: 4, y: 0 }, width: 1, height: 2 },
    { kind: 'header', anchor: { x: 5, y: 0 }, width: 1, height: 2 }
  ]);
  t.deepEqual(global.theTable.slots[4][0].elements[0], tr.children().skip(3).first().get());
  t.deepEqual(global.theTable.slots[4][1],  {
    x: 4,
    y: 1,
    elements: [],
    cell: Some.of({
      kind: 'header',
      anchor: { x: 4, y: 0 },
      width: 1,
      height: 2
  } as Cell)
})
});

test("Process row group", t => {
  const thead = Element.fromElement(<thead>
  <tr>
    <th rowspan={2}>Grade.</th>
    <th rowspan={2}>Yield Point.</th>
    <th colspan={2}>Ultimate tensile strength</th>
    <th rowspan={2}>Per cent elong. 50.8mm or 2 in.</th>
    <th rowspan={2}>Per cent reduct. area.</th>
  </tr>
  <tr>
    <th>kg/mm<sup>2</sup></th>
    <th>lb/in<sup>2</sup></th>
  </tr>
  </thead>);

  initTable(6, 2);

  processRowGroup(thead);
  t.equal(global.theTable.rowGroups[0].element, thead);
});
