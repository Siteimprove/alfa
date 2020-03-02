import {None, Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Cell, Element, Slot, Table} from "../../src";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import and = Predicate.and;

export function makeSlot(x: number, y: number): Slot {
  return {x: x, y:y, elements: [], cell: None};
}

function makeCell(kind: "header" | "data", x: number, y: number, w: number, h: number): Cell {
  return {kind: kind, anchor: {x:x, y:y}, width: w, height: h}
}

function hasID(id: string): Predicate<Element> {
  return (element) => {
    const idAttr = element.attribute("id");
    return idAttr.isSome() ? idAttr.get().value === id : false
  }
}

const dummy = Element.of(None, None, "dummy");
const getById = (element: Element, id: string) => element.descendants().filter(and(Element.isElement, hasID(id))).first().getOr(dummy);

// processing simple row
export const simpleRow = Element.fromElement(<tr><th id="first">1</th><td>2</td></tr>);
export const simpleRowTable: Table = {
  slots: [
    [{x:0, y:0, elements: [simpleRow.children().get(0).get() as Element], cell: Some.of(makeCell("header", 0, 0, 1 ,1))}],
    [{x:1, y:0, elements: [simpleRow.children().get(1).get() as Element], cell: Some.of(makeCell("data", 1, 0, 1, 1))}]
  ],
  cells: [makeCell("header", 0, 0, 1 ,1), makeCell("data", 1, 0, 1, 1)],
  width: 0, height: 0, rowGroups: [], colGroups: []
};

// Examples taken from https://html.spec.whatwg.org/multipage/tables.html#table-examples

// processing complex row
export const complexRow = Element.fromElement(<tr>
  <th id="grade" rowspan={2}>Grade.</th>
  <th id="yield" rowspan={2}>Yield Point.</th>
  <th id="strength" colspan={2}>Ultimate tensile strength</th>
  <th id="elong" rowspan={2}>Per cent elong. 50.8mm or 2 in.</th>
  <th id="reduct" rowspan={2}>Per cent reduct. area.</th>
</tr>);
export const complexRowTable: Table = {
  slots: [
    [{x:0, y:0, elements: [getById(complexRow, "grade")], cell: Some.of(makeCell("header", 0, 0, 1, 2))},
      {x:0, y:1, elements: [], cell: Some.of(makeCell("header", 0, 0, 1, 2))}],
    [{x:1, y:0, elements: [getById(complexRow, "yield")], cell: Some.of(makeCell("header", 1, 0, 1, 2))},
      {x:1, y:1, elements: [], cell: Some.of(makeCell("header", 1, 0, 1, 2))}],
    [{x:2, y:0, elements: [getById(complexRow, "strength")], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
      makeSlot(2, 1)],
    [{x:3, y:0, elements: [], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
      makeSlot(3, 1)],
    [{x:4, y:0, elements: [getById(complexRow, "elong")], cell: Some.of(makeCell("header", 4, 0, 1, 2))},
      {x:4, y:1, elements: [], cell: Some.of(makeCell("header", 4, 0, 1, 2))}],
    [{x:5, y:0, elements: [getById(complexRow, "reduct")], cell: Some.of(makeCell("header", 5, 0, 1, 2))},
      {x:5, y:1, elements: [], cell: Some.of(makeCell("header", 5, 0, 1, 2))}],
  ],
  cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
    makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2)],
  width: 0, height: 0, rowGroups: [], colGroups: []
};

// processing row group
export const rowGroup = Element.fromElement(<thead>
<tr>
  <th id="grade" rowspan={2}>Grade.</th>
  <th id="yield" rowspan={2}>Yield Point.</th>
  <th id="strength" colspan={2}>Ultimate tensile strength</th>
  <th id="elong" rowspan={2}>Per cent elong. 50.8mm or 2 in.</th>
  <th id="reduct" rowspan={2}>Per cent reduct. area.</th>
</tr>
<tr>
  <th id="kg-mm">kg/mm<sup>2</sup></th>
  <th id="lb-in">lb/in<sup>2</sup></th>
</tr>
</thead>);
export const rowGroupTable: Table = {
  slots: [
    [{x:0, y:0, elements: [getById(rowGroup, "grade")], cell: Some.of(makeCell("header", 0, 0, 1, 2))},
      {x:0, y:1, elements: [], cell: Some.of(makeCell("header", 0, 0, 1, 2))}],
    [{x:1, y:0, elements: [getById(rowGroup, "yield")], cell: Some.of(makeCell("header", 1, 0, 1, 2))},
      {x:1, y:1, elements: [], cell: Some.of(makeCell("header", 1, 0, 1, 2))}],
    [{x:2, y:0, elements: [getById(rowGroup, "strength")], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
      {x:2, y:1, elements: [getById(rowGroup, "kg-mm")], cell: Some.of(makeCell("header", 2, 1, 1, 1))}],
    [{x:3, y:0, elements: [], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
      {x:3, y:1, elements: [getById(rowGroup, "lb-in")], cell: Some.of(makeCell("header", 3, 1, 1, 1))}],
    [{x:4, y:0, elements: [getById(rowGroup, "elong")], cell: Some.of(makeCell("header", 4, 0, 1, 2))},
      {x:4, y:1, elements: [], cell: Some.of(makeCell("header", 4, 0, 1, 2))}],
    [{x:5, y:0, elements: [getById(rowGroup, "reduct")], cell: Some.of(makeCell("header", 5, 0, 1, 2))},
      {x:5, y:1, elements: [], cell: Some.of(makeCell("header", 5, 0, 1, 2))}],
  ],
  cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
    makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2), makeCell("header", 2, 1, 1, 1),
  makeCell("header", 3, 1, 1, 1)],
  width: 0, height: 0, rowGroups: [{anchor: {y:0}, height:2, element: rowGroup}], colGroups: []
};

