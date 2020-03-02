import {None, Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Cell, Element, Slot, Table} from "../../src";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import and = Predicate.and;

export function makeSlot(x: number, y: number, element: Element | null = null, cell: Cell | null = null): Slot {
  return {x: x, y:y, elements: element === null ? [] : [element], cell: Option.from(cell)};
}

function makeCell(kind: "header" | "data", x: number, y: number, w: number = 1, h: number = 1): Cell {
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
export namespace simpleRow {
  export const element = Element.fromElement(<tr>
    <th id="first">1</th>
    <td id="second">2</td>
  </tr>);
  export const expected: Table = {
    slots: [
      [ makeSlot(0,0, getById(element, "first"), makeCell("header", 0, 0)) ],
      [ makeSlot(1, 0, getById(element, "second"), makeCell("data", 1, 0)) ]
    ],
    cells: [makeCell("header", 0, 0), makeCell("data", 1, 0)],
    width: 2, height: 1, rowGroups: [], colGroups: []
  };
}

// Examples taken from https://html.spec.whatwg.org/multipage/tables.html#table-examples

// processing complex row
export namespace complexRow {
  export const element = Element.fromElement(<tr>
    <th id="grade" rowspan={2}>Grade.</th>
    <th id="yield" rowspan={2}>Yield Point.</th>
    <th id="strength" colspan={2}>Ultimate tensile strength</th>
    <th id="elong" rowspan={2}>Per cent elong. 50.8mm or 2 in.</th>
    <th id="reduct" rowspan={2}>Per cent reduct. area.</th>
  </tr>);
  export const expected: Table = {
    slots: [
      [ makeSlot(0, 0, getById(element, "grade"), makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 1, null, makeCell("header", 0, 0, 1, 2))],
      [ makeSlot(1, 0, getById(element, "yield"), makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 1, null, makeCell("header", 1, 0, 1, 2))],
      [ makeSlot(2, 0, getById(element, "strength"), makeCell("header", 2, 0, 2, 1)),
        makeSlot(2, 1)],
      [ makeSlot(3, 0, null, makeCell("header", 2, 0, 2, 1)),
        makeSlot(3, 1)],
      [ makeSlot(4,0, getById(element, "elong"), makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 1, null, makeCell("header", 4, 0, 1, 2))],
      [ makeSlot(5, 0, getById(element, "reduct"), makeCell("header", 5, 0, 1, 2)),
        makeSlot(5, 1, null, makeCell("header", 5, 0, 1, 2))]
    ],
    cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
      makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2)],
    width: 6, height: 2, rowGroups: [], colGroups: []
  };
}

// processing row group
export namespace rowGroup {
  export const element = Element.fromElement(<thead>
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
  export const expected: Table = {
    slots: [
      [ makeSlot(0, 0, getById(element, "grade"), makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 1, null, makeCell("header", 0, 0, 1, 2))],
      [ makeSlot(1, 0, getById(element, "yield"), makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 1, null, makeCell("header", 1, 0, 1, 2))],
      [ makeSlot(2, 0, getById(element, "strength"), makeCell("header", 2, 0, 2, 1)),
        makeSlot(2, 1, getById(element, "kg-mm"), makeCell("header", 2, 1))],
      [ makeSlot(3, 0, null, makeCell("header", 2, 0, 2, 1)),
        makeSlot(3, 1, getById(element, "lb-in"), makeCell("header", 3, 1))],
      [ makeSlot(4,0, getById(element, "elong"), makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 1, null, makeCell("header", 4, 0, 1, 2))],
      [ makeSlot(5, 0, getById(element, "reduct"), makeCell("header", 5, 0, 1, 2)),
        makeSlot(5, 1, null, makeCell("header", 5, 0, 1, 2))]
    ],
    cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
      makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2), makeCell("header", 2, 1),
      makeCell("header", 3, 1)],
    width: 6, height: 2, rowGroups: [{anchor: {y: 0}, height: 2, element: element}], colGroups: []
  };
}

export namespace smithonian {
  export const element = Element.fromElement(<table>
    <caption>Specification values: <b>Steel</b>, <b>Castings</b>,
      Ann. A.S.T.M. A27-16, Class B;* P max. 0.06; S max. 0.05.
    </caption>
    <thead id="thead">
    <tr>
      <th id="grade" rowSpan={2}>Grade.</th>
      <th id="yield" rowSpan={2}>Yield Point.</th>
      <th id="strength" colSpan={2}>Ultimate tensile strength</th>
      <th id="elong" rowSpan={2}>Per cent elong. 50.8mm or 2 in.</th>
      <th id="reduct" rowSpan={2}>Per cent reduct. area.</th>
    </tr>
    <tr>
      <th id="kg-mm">kg/mm<sup>2</sup></th>
      <th id="lb-in">lb/in<sup>2</sup></th>
    </tr>
    </thead>
    <tbody id="tbody">
    <tr>
      <td id="hard">Hard</td>
      <td id="hard-yield">0.45 ultimate</td>
      <td id="hard-kg">56.2</td>
      <td id="hard-lb">80,000</td>
      <td id="hard-elong">15</td>
      <td id="hard-reduct">20</td>
    </tr>
    <tr>
      <td id="medium">Medium</td>
      <td id="medium-yield">0.45 ultimate</td>
      <td id="medium-kg">49.2</td>
      <td id="medium-lb">70,000</td>
      <td id="medium-elong">18</td>
      <td id="medium-reduct">25</td>
    </tr>
    <tr>
      <td id="soft">Soft</td>
      <td id="soft-yield">0.45 ultimate</td>
      <td id="soft-kg">42.2</td>
      <td id="soft-lb">60,000</td>
      <td id="soft-elong">22</td>
      <td id="soft-reduct">30</td>
    </tr>
    </tbody>
  </table>);

  export const expected: Table = {
    slots: [
      [{x: 0, y: 0, elements: [getById(element, "grade")], cell: Some.of(makeCell("header", 0, 0, 1, 2))},
        {x: 0, y: 1, elements: [], cell: Some.of(makeCell("header", 0, 0, 1, 2))},
        {x:0, y:2, elements: [getById(element, "hard")], cell: Some.of(makeCell("data", 0, 2, 1 ,1))}
      ],
      [{x: 1, y: 0, elements: [getById(element, "yield")], cell: Some.of(makeCell("header", 1, 0, 1, 2))},
        {x: 1, y: 1, elements: [], cell: Some.of(makeCell("header", 1, 0, 1, 2))}],
      [{x: 2, y: 0, elements: [getById(element, "strength")], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
        {x: 2, y: 1, elements: [getById(element, "kg-mm")], cell: Some.of(makeCell("header", 2, 1, 1, 1))}],
      [{x: 3, y: 0, elements: [], cell: Some.of(makeCell("header", 2, 0, 2, 1))},
        {x: 3, y: 1, elements: [getById(element, "lb-in")], cell: Some.of(makeCell("header", 3, 1, 1, 1))}],
      [{x: 4, y: 0, elements: [getById(element, "elong")], cell: Some.of(makeCell("header", 4, 0, 1, 2))},
        {x: 4, y: 1, elements: [], cell: Some.of(makeCell("header", 4, 0, 1, 2))}],
      [{x: 5, y: 0, elements: [getById(element, "reduct")], cell: Some.of(makeCell("header", 5, 0, 1, 2))},
        {x: 5, y: 1, elements: [], cell: Some.of(makeCell("header", 5, 0, 1, 2))}]
    ],
    cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
      makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2), makeCell("header", 2, 1, 1, 1),
      makeCell("header", 3, 1, 1, 1)],
    width: 6, height: 5, rowGroups: [], colGroups: []
  }
}
