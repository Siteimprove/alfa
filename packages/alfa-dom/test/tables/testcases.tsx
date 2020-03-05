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
  return cells.sort((c1, c2) => c1.anchor.y - c2.anchor.y);
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
    cells: getCells(slots),
    width: 6, height: 2, colGroups: [],
    rowGroups: [{anchor: {y: 0}, height: 2, element: element}]
  };
}

// table with row group, colspan and rowspan
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
  export const expected: Table =  {
    slots: slots,
    cells: getCells(slots),
    width: 6, height: 5, colGroups: [] ,
    rowGroups: [{anchor: {y: 0}, height: 2, element: getById("thead")}, {anchor: {y: 2}, height: 3, element: getById("tbody")}]
  }
}

// table with a tfoot in the middle
export namespace apple {
  export const element = Element.fromElement(<table>
    <thead id="thead">
    <tr id="tr">
      <th id="empty"></th>
      <th id="2008">2008</th>
      <th id="2007">2007</th>
      <th id="2006">2006</th>
    </tr>
    </thead>
    <tfoot id="tfoot">
    <tr>
      <th id="percent">Gross margin percentage</th>
      <td id="percent-2008">34.3%</td>
      <td id="percent-2007">34.0%</td>
      <td id="percent-2006">29.0%</td>
    </tr>
    </tfoot>
    <tbody id="body-1">
    <tr>
      <th id="net">Net sales</th>
      <td id="net-2008">$ 32,479</td>
      <td id="net-2007">$ 24,006</td>
      <td id="net-2006">$ 19,315</td>
    </tr>
    <tr>
      <th id="cost">Cost of sales</th>
      <td id="cost-2008">21,334</td>
      <td id="cost-2007">15,852</td>
      <td id="cost-2006">13,717</td>
    </tr>
    </tbody>
    <tbody id="body-2">
    <tr>
      <th id="margin">Gross margin</th>
      <td id="margin-2008">$ 11,145</td>
      <td id="margin-2007">$ 8,154</td>
      <td id="margin-2006">$ 5,598</td>
    </tr>
    </tbody>
  </table>);
  const getById = getDescendantById(element);

  const slots = [
    [ makeSlot(makeCell("header", 0, 0), getById("empty")),
      makeSlot(makeCell("header", 0, 1), getById("net")),
      makeSlot(makeCell("header", 0, 2), getById("cost")),
      makeSlot(makeCell("header", 0, 3), getById("margin")),
      makeSlot(makeCell("header", 0, 4), getById("percent"))
    ],
    [ makeSlot(makeCell("header", 1, 0), getById("2008")),
      makeSlot(makeCell("data", 1, 1), getById("net-2008")),
      makeSlot(makeCell("data", 1, 2), getById("cost-2008")),
      makeSlot(makeCell("data", 1, 3), getById("margin-2008")),
      makeSlot(makeCell("data", 1, 4), getById("percent-2008"))
    ],
    [ makeSlot(makeCell("header", 2, 0), getById("2007")),
      makeSlot(makeCell("data", 2, 1), getById("net-2007")),
      makeSlot(makeCell("data", 2, 2), getById("cost-2007")),
      makeSlot(makeCell("data", 2, 3), getById("margin-2007")),
      makeSlot(makeCell("data", 2, 4), getById("percent-2007"))
    ],
    [ makeSlot(makeCell("header", 3, 0), getById("2006")),
      makeSlot(makeCell("data", 3, 1), getById("net-2006")),
      makeSlot(makeCell("data", 3, 2), getById("cost-2006")),
      makeSlot(makeCell("data", 3, 3), getById("margin-2006")),
      makeSlot(makeCell("data", 3, 4), getById("percent-2006"))
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    cells: getCells(slots),
    width: 4, height: 5, colGroups: [],
    rowGroups: [
      {anchor: {y: 0}, height: 1, element: getById("thead")},
      {anchor: {y: 1}, height: 2, element: getById("body-1")},
      {anchor: {y: 3}, height: 1, element: getById("body-2")},
      {anchor: {y: 4}, height: 1, element: getById("tfoot")}
      ]
  }
}

// example with colgroup
export namespace expenses {
  export const element = Element.fromElement(<table>
    <colgroup id="group-head"> <col/>
    </colgroup>
    <colgroup id="group-body"> <col/> <col/> <col/>
    </colgroup>
    <thead id="thead">
    <tr> <th id="empty"/> <th id="2008">2008</th> <th id="2007">2007</th> <th id="2006">2006</th>
    </tr>
    </thead>
    <tbody id="body-1">
    <tr> <th id="rd" scope="rowgroup"> Research and development</th>
      <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td> <td id="rd-2006">$ 712</td>
    </tr>
    <tr> <th id="rd-percent" scope="row"> Percentage of net sales</th>
      <td id="rd-percent-2008">3.4%</td> <td id="rd-percent-2007">3.3%</td> <td id="rd-percent-2006">3.7%</td>
    </tr>
    </tbody>
    <tbody id="body-2">
    <tr> <th id="sales" scope="rowgroup"> Selling, general, and administrative</th>
      <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td> <td id="sales-2006">$ 2,433</td>
    </tr>
    <tr> <th id="sales-percent" scope="row"> Percentage of net sales</th>
      <td id="sales-percent-2008">11.6%</td> <td  id="sales-percent-2007">12.3%</td> <td  id="sales-percent-2006">12.6%</td>
    </tr>
    </tbody>
  </table>);
  const getById = getDescendantById(element);

  const slots = [
    [ makeSlot(makeCell("header", 0, 0), getById("empty")),
      makeSlot(makeCell("header", 0, 1), getById("rd")),
      makeSlot(makeCell("header", 0, 2), getById("rd-percent")),
      makeSlot(makeCell("header", 0, 3), getById("sales")),
      makeSlot(makeCell("header", 0, 4), getById("sales-percent")),
    ],
    [ makeSlot(makeCell("header", 1, 0), getById("2008")),
      makeSlot(makeCell("data", 1, 1), getById("rd-2008")),
      makeSlot(makeCell("data", 1, 2), getById("rd-percent-2008")),
      makeSlot(makeCell("data", 1, 3), getById("sales-2008")),
      makeSlot(makeCell("data", 1, 4), getById("sales-percent-2008")),
    ],
    [ makeSlot(makeCell("header", 2, 0), getById("2007")),
      makeSlot(makeCell("data", 2, 1), getById("rd-2007")),
      makeSlot(makeCell("data", 2, 2), getById("rd-percent-2007")),
      makeSlot(makeCell("data", 2, 3), getById("sales-2007")),
      makeSlot(makeCell("data", 2, 4), getById("sales-percent-2007")),
    ],
    [ makeSlot(makeCell("header", 3, 0), getById("2006")),
      makeSlot(makeCell("data", 3, 1), getById("rd-2006")),
      makeSlot(makeCell("data", 3, 2), getById("rd-percent-2006")),
      makeSlot(makeCell("data", 3, 3), getById("sales-2006")),
      makeSlot(makeCell("data", 3, 4), getById("sales-percent-2006")),
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    cells: getCells(slots),
    width: 4, height: 5,
    colGroups: [
      {anchor: {x:0}, width: 1, element: getById("group-head")},
      {anchor: {x:1}, width: 3, element: getById("group-body")}
    ],
    rowGroups: [
      {anchor: {y: 0}, height: 1, element: getById("thead")},
      {anchor: {y: 1}, height: 2, element: getById("body-1")},
      {anchor: {y: 3}, height: 2, element: getById("body-2")}
    ]
  }
}

// same with colgroup defined by spans
export namespace expensesNum {
  export const element = Element.fromElement(<table>
    <colgroup id="group-head" span={1}>
    </colgroup>
    <colgroup id="group-body"> <col span={2}/> <col/>
    </colgroup>
    <thead id="thead">
    <tr> <th id="empty"/> <th id="2008">2008</th> <th id="2007">2007</th> <th id="2006">2006</th>
    </tr>
    </thead>
    <tbody id="body-1">
    <tr> <th id="rd" scope="rowgroup"> Research and development</th>
      <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td> <td id="rd-2006">$ 712</td>
    </tr>
    <tr> <th id="rd-percent" scope="row"> Percentage of net sales</th>
      <td id="rd-percent-2008">3.4%</td> <td id="rd-percent-2007">3.3%</td> <td id="rd-percent-2006">3.7%</td>
    </tr>
    </tbody>
    <tbody id="body-2">
    <tr> <th id="sales" scope="rowgroup"> Selling, general, and administrative</th>
      <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td> <td id="sales-2006">$ 2,433</td>
    </tr>
    <tr> <th id="sales-percent" scope="row"> Percentage of net sales</th>
      <td id="sales-percent-2008">11.6%</td> <td  id="sales-percent-2007">12.3%</td> <td  id="sales-percent-2006">12.6%</td>
    </tr>
    </tbody>
  </table>);
  const getById = getDescendantById(element);

  const slots = [
    [ makeSlot(makeCell("header", 0, 0), getById("empty")),
      makeSlot(makeCell("header", 0, 1), getById("rd")),
      makeSlot(makeCell("header", 0, 2), getById("rd-percent")),
      makeSlot(makeCell("header", 0, 3), getById("sales")),
      makeSlot(makeCell("header", 0, 4), getById("sales-percent")),
    ],
    [ makeSlot(makeCell("header", 1, 0), getById("2008")),
      makeSlot(makeCell("data", 1, 1), getById("rd-2008")),
      makeSlot(makeCell("data", 1, 2), getById("rd-percent-2008")),
      makeSlot(makeCell("data", 1, 3), getById("sales-2008")),
      makeSlot(makeCell("data", 1, 4), getById("sales-percent-2008")),
    ],
    [ makeSlot(makeCell("header", 2, 0), getById("2007")),
      makeSlot(makeCell("data", 2, 1), getById("rd-2007")),
      makeSlot(makeCell("data", 2, 2), getById("rd-percent-2007")),
      makeSlot(makeCell("data", 2, 3), getById("sales-2007")),
      makeSlot(makeCell("data", 2, 4), getById("sales-percent-2007")),
    ],
    [ makeSlot(makeCell("header", 3, 0), getById("2006")),
      makeSlot(makeCell("data", 3, 1), getById("rd-2006")),
      makeSlot(makeCell("data", 3, 2), getById("rd-percent-2006")),
      makeSlot(makeCell("data", 3, 3), getById("sales-2006")),
      makeSlot(makeCell("data", 3, 4), getById("sales-percent-2006")),
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    cells: getCells(slots),
    width: 4, height: 5,
    colGroups: [
      {anchor: {x:0}, width: 1, element: getById("group-head")},
      {anchor: {x:1}, width: 3, element: getById("group-body")}
    ],
    rowGroups: [
      {anchor: {y: 0}, height: 1, element: getById("thead")},
      {anchor: {y: 1}, height: 2, element: getById("body-1")},
      {anchor: {y: 3}, height: 2, element: getById("body-2")}
    ]
  }
}
