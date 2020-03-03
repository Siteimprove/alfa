import {None, Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Cell, Element, Slot, Table} from "../../src";
import {jsx} from "@siteimprove/alfa-dom/jsx";
import and = Predicate.and;

export function makeSlot(x: number, y: number, element: Element | null = null, cell: Cell | null = null): Slot {
  return {x: x, y: y, elements: element === null ? [] : [element], cell: Option.from(cell)};
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

// processing simple row
export namespace simpleRow {
  export const element = Element.fromElement(<tr>
    <th id="first">1</th>
    <td id="second">2</td>
  </tr>);
  const getById = getDescendantById(element);

  export const expected: Table = {
    slots: [
      [makeSlot(0, 0, getById("first"), makeCell("header", 0, 0))],
      [makeSlot(1, 0, getById("second"), makeCell("data", 1, 0))]
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
  const getById = getDescendantById(element);

  export const expected: Table = {
    slots: [
      [makeSlot(0, 0, getById("grade"), makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 1, null, makeCell("header", 0, 0, 1, 2))],
      [makeSlot(1, 0, getById("yield"), makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 1, null, makeCell("header", 1, 0, 1, 2))],
      [makeSlot(2, 0, getById("strength"), makeCell("header", 2, 0, 2, 1)),
        makeSlot(2, 1)],
      [makeSlot(3, 0, null, makeCell("header", 2, 0, 2, 1)),
        makeSlot(3, 1)],
      [makeSlot(4, 0, getById("elong"), makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 1, null, makeCell("header", 4, 0, 1, 2))],
      [makeSlot(5, 0, getById("reduct"), makeCell("header", 5, 0, 1, 2)),
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
  const getById = getDescendantById(element);

  export const expected: Table = {
    slots: [
      [makeSlot(0, 0, getById("grade"), makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 1, null, makeCell("header", 0, 0, 1, 2))],
      [makeSlot(1, 0, getById("yield"), makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 1, null, makeCell("header", 1, 0, 1, 2))],
      [makeSlot(2, 0, getById("strength"), makeCell("header", 2, 0, 2, 1)),
        makeSlot(2, 1, getById("kg-mm"), makeCell("header", 2, 1))],
      [makeSlot(3, 0, null, makeCell("header", 2, 0, 2, 1)),
        makeSlot(3, 1, getById("lb-in"), makeCell("header", 3, 1))],
      [makeSlot(4, 0, getById("elong"), makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 1, null, makeCell("header", 4, 0, 1, 2))],
      [makeSlot(5, 0, getById("reduct"), makeCell("header", 5, 0, 1, 2)),
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
  const getById = getDescendantById(element);

  export const expected: Table = {
    slots: [
      [ makeSlot(0, 0, getById("grade"), makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 1, null, makeCell("header", 0, 0, 1, 2)),
        makeSlot(0, 2, getById("hard"), makeCell("data", 0, 2)),
        makeSlot(0, 3, getById("medium"), makeCell("data", 0, 3)),
        makeSlot(0, 4, getById("soft"), makeCell("data", 0, 4))
      ],
      [ makeSlot(1, 0, getById("yield"), makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 1, null, makeCell("header", 1, 0, 1, 2)),
        makeSlot(1, 2, getById("hard-yield"), makeCell("data", 1, 2)),
        makeSlot(1, 3, getById("medium-yield"), makeCell("data", 1, 3)),
        makeSlot(1, 4, getById("soft-yield"), makeCell("data", 1, 4))
      ],
      [ makeSlot(2, 0, getById("strength"), makeCell("header", 2, 0, 2, 1)),
        makeSlot(2, 1, getById("kg-mm"), makeCell("header", 2, 1)),
        makeSlot(2, 2, getById("hard-kg"), makeCell("data", 2, 2)),
        makeSlot(2, 3, getById("medium-kg"), makeCell("data", 2, 3)),
        makeSlot(2, 4, getById("soft-kg"), makeCell("data", 2, 4))
      ],
      [ makeSlot(3, 0, null, makeCell("header", 2, 0, 2, 1)),
        makeSlot(3, 1, getById("lb-in"), makeCell("header", 3, 1)),
        makeSlot(3, 2, getById("hard-lb"), makeCell("data", 3, 2)),
        makeSlot(3, 3, getById("medium-lb"), makeCell("data", 3, 3)),
        makeSlot(3, 4, getById("soft-lb"), makeCell("data", 3, 4)),
      ],
      [ makeSlot(4, 0, getById("elong"), makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 1, null, makeCell("header", 4, 0, 1, 2)),
        makeSlot(4, 2, getById("hard-elong"), makeCell("data", 4, 2)),
        makeSlot(4, 3, getById("medium-elong"), makeCell("data", 4, 3)),
        makeSlot(4, 4, getById("soft-elong"), makeCell("data", 4, 4)),
      ],
      [ makeSlot(5, 0, getById("reduct"), makeCell("header", 5, 0, 1, 2)),
        makeSlot(5, 1, null, makeCell("header", 5, 0, 1, 2)),
        makeSlot(5, 2, getById("hard-reduct"), makeCell("data", 5, 2)),
        makeSlot(5, 3, getById("medium-reduct"), makeCell("data", 5, 3)),
        makeSlot(5, 4, getById("soft-reduct"), makeCell("data", 5, 4)),
      ]
    ],
    cells: [makeCell("header", 0, 0, 1, 2), makeCell("header", 1, 0, 1, 2), makeCell("header", 2, 0, 2, 1),
      makeCell("header", 4, 0, 1, 2), makeCell("header", 5, 0, 1, 2), makeCell("header", 2, 1, 1, 1),
      makeCell("header", 3, 1, 1, 1)],
    width: 6, height: 5, rowGroups: [], colGroups: []
  }
}
