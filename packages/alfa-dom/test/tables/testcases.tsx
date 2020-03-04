import {None, Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Cell, Element, Slot, Table} from "../../src";
import {jsx} from "@siteimprove/alfa-dom/jsx";
import and = Predicate.and;

export function makeSlot(cell: Cell | null = null, element: Element | null = null): Slot {
  return { elements: element === null ? [] : [element], cell: Option.from(cell)};
}

function makeCell(kind: "header" | "data", x: number, y: number, w: number = 1, h: number = 1): Cell {
  return {kind: kind, anchor: {x: x, y: y}, width: w, height: h}
}

function hasID(id: string): Predicate<Element> {
  return (element) => {
    const idAttr = element.attribute("id");
    return idAttr.isSome() ? idAttr.get().value === id : false
  }
}

const dummy = Element.of(None, None, "dummy");
const getDescendantById = (element: Element) => (id: string) => element.descendants().filter(and(Element.isElement, hasID(id))).first().getOr(dummy);


function eqCells(c1: Cell, c2: Cell): boolean {
  return c1.kind === c2.kind &&
    c1.anchor.x === c2.anchor.x &&
    c1.anchor.y === c2.anchor.y &&
    c1.width === c2.width &&
    c1.height === c2.height
}
function getCells(slots: Array<Array<Slot>>): Array<Cell> {
  const cells: Array<Cell> = [];
  for (const sLine of slots) {
    for (const slot of sLine) {
      slot.cell.map(cell => cells.find(c2 => eqCells(cell, c2)) ? null : cells.push(cell))
    }
  }
  return cells;
}

// processing simple row
export namespace simpleRow {
  export const element = Element.fromElement(<tr>
    <th id="first">1</th>
    <td id="second">2</td>
  </tr>);
  const getById = getDescendantById(element);

  const slots = [
    [makeSlot(makeCell("header", 0, 0), getById("first"))],
    [makeSlot(makeCell("data", 1, 0), getById("second"))]
  ];

  export const expected: Table = {
    slots: slots,
    cells: getCells(slots),
    width: 2, height: 1, rowGroups: [], colGroups: []
  };
}

// Examples taken from https://html.spec.whatwg.org/multipage/tables.html#table-examples

// processing complex row
export namespace complexRow {
  export const element = Element.fromElement(<tr>
    <th id="grade" rowSpan={2}>Grade.</th>
    <th id="yield" rowSpan={2}>Yield Point.</th>
    <th id="strength" colSpan={2}>Ultimate tensile strength</th>
    <th id="elong" rowSpan={2}>Per cent elong. 50.8mm or 2 in.</th>
    <th id="reduct" rowSpan={2}>Per cent reduct. area.</th>
  </tr>);
  const getById = getDescendantById(element);

  const slots = [
    [makeSlot(makeCell("header", 0, 0, 1, 2), getById("grade")),
      makeSlot(makeCell("header", 0, 0, 1, 2))],
    [makeSlot(makeCell("header", 1, 0, 1, 2), getById("yield")),
      makeSlot(makeCell("header", 1, 0, 1, 2))],
    [makeSlot(makeCell("header", 2, 0, 2, 1), getById("strength")),
      makeSlot()],
    [makeSlot(makeCell("header", 2, 0, 2, 1)),
      makeSlot()],
    [makeSlot(makeCell("header", 4, 0, 1, 2), getById("elong")),
      makeSlot(makeCell("header", 4, 0, 1, 2))],
    [makeSlot(makeCell("header", 5, 0, 1, 2), getById("reduct")),
      makeSlot(makeCell("header", 5, 0, 1, 2))]
  ];
  export const expected: Table = {
    slots: slots,
    cells: getCells(slots),
    width: 6, height: 2, rowGroups: [], colGroups: []
  };
}

// processing row group
export namespace rowGroup {
  export const element = Element.fromElement(<thead id="thead">
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
  </thead>);
  const getById = getDescendantById(element);

  const slots = [
    [makeSlot(makeCell("header", 0, 0, 1, 2), getById("grade")),
      makeSlot(makeCell("header", 0, 0, 1, 2))],
    [makeSlot(makeCell("header", 1, 0, 1, 2), getById("yield")),
      makeSlot(makeCell("header", 1, 0, 1, 2))],
    [makeSlot(makeCell("header", 2, 0, 2, 1), getById("strength")),
      makeSlot(makeCell("header", 2, 1), getById("kg-mm"))],
    [makeSlot(makeCell("header", 2, 0, 2, 1)),
      makeSlot(makeCell("header", 3, 1), getById("lb-in"))],
    [makeSlot(makeCell("header", 4, 0, 1, 2), getById("elong")),
      makeSlot(makeCell("header", 4, 0, 1, 2))],
    [makeSlot(makeCell("header", 5, 0, 1, 2), getById("reduct")),
      makeSlot(makeCell("header", 5, 0, 1, 2))]
  ];
  export const expected: Table = {
    slots: slots,
    cells: getCells(slots).sort((c1, c2) => c1.anchor.y - c2.anchor.y),
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
  const getById = getDescendantById(element);

  const slots = [
    [ makeSlot(makeCell("header", 0, 0, 1, 2), getById("grade")),
      makeSlot(makeCell("header", 0, 0, 1, 2)),
      makeSlot(makeCell("data", 0, 2), getById("hard")),
      makeSlot(makeCell("data", 0, 3), getById("medium")),
      makeSlot(makeCell("data", 0, 4), getById("soft"))
    ],
    [ makeSlot(makeCell("header", 1, 0, 1, 2), getById("yield")),
      makeSlot(makeCell("header", 1, 0, 1, 2)),
      makeSlot(makeCell("data", 1, 2), getById("hard-yield")),
      makeSlot(makeCell("data", 1, 3), getById("medium-yield")),
      makeSlot(makeCell("data", 1, 4), getById("soft-yield"))
    ],
    [ makeSlot(makeCell("header", 2, 0, 2, 1), getById("strength")),
      makeSlot(makeCell("header", 2, 1), getById("kg-mm")),
      makeSlot(makeCell("data", 2, 2), getById("hard-kg")),
      makeSlot(makeCell("data", 2, 3), getById("medium-kg")),
      makeSlot(makeCell("data", 2, 4), getById("soft-kg"))
    ],
    [ makeSlot(makeCell("header", 2, 0, 2, 1)),
      makeSlot(makeCell("header", 3, 1), getById("lb-in")),
      makeSlot(makeCell("data", 3, 2), getById("hard-lb")),
      makeSlot(makeCell("data", 3, 3), getById("medium-lb")),
      makeSlot(makeCell("data", 3, 4), getById("soft-lb")),
    ],
    [ makeSlot(makeCell("header", 4, 0, 1, 2), getById("elong")),
      makeSlot(makeCell("header", 4, 0, 1, 2)),
      makeSlot(makeCell("data", 4, 2), getById("hard-elong")),
      makeSlot(makeCell("data", 4, 3), getById("medium-elong")),
      makeSlot(makeCell("data", 4, 4), getById("soft-elong")),
    ],
    [ makeSlot(makeCell("header", 5, 0, 1, 2), getById("reduct")),
      makeSlot(makeCell("header", 5, 0, 1, 2)),
      makeSlot(makeCell("data", 5, 2), getById("hard-reduct")),
      makeSlot(makeCell("data", 5, 3), getById("medium-reduct")),
      makeSlot(makeCell("data", 5, 4), getById("soft-reduct")),
    ]
  ];
  export const expected: Table = {
    slots: slots,
    cells: getCells(slots).sort((c1, c2) => c1.anchor.y - c2.anchor.y),
    width: 6, height: 5, rowGroups: [], colGroups: []
  }
}
