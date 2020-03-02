import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {Element, Slot, global, rowProcessing, Cell, processRowGroup} from "../../src";
import {complexRow, complexRowTable, makeSlot, rowGroup, rowGroupTable, simpleRow, simpleRowTable} from "./testcases";

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
  initTable(2, 1);

  rowProcessing(simpleRow);

  t.deepEqual(global.theTable, simpleRowTable);
});

test("Process complex row", t => {
  initTable(6, 2);

  rowProcessing(complexRow);

  t.deepEqual(global.theTable, complexRowTable);
});

test("Process row group", t => {
  initTable(6, 2);

  processRowGroup(rowGroup);

  t.deepEqual(global.theTable, rowGroupTable);
});

test("Process table", t => {
  const table = Element.fromElement(<table>
    <caption>Specification values: <b>Steel</b>, <b>Castings</b>,
      Ann. A.S.T.M. A27-16, Class B;* P max. 0.06; S max. 0.05.</caption>
    <thead>
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
    </thead>
    <tbody>
    <tr>
      <td>Hard</td>
      <td>0.45 ultimate</td>
      <td>56.2</td>
      <td>80,000</td>
      <td>15</td>
      <td>20</td>
    </tr>
    <tr>
      <td>Medium</td>
      <td>0.45 ultimate</td>
      <td>49.2</td>
      <td>70,000</td>
      <td>18</td>
      <td>25</td>
    </tr>
    <tr>
      <td>Soft</td>
      <td>0.45 ultimate</td>
      <td>42.2</td>
      <td>60,000</td>
      <td>22</td>
      <td>30</td>
    </tr>
    </tbody>
  </table>)
});
