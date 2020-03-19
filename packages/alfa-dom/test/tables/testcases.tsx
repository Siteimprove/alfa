import {None, Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Cell, Element, Slot, Table} from "../../src";
import {jsx} from "@siteimprove/alfa-dom/jsx";
import and = Predicate.and;

export function makeSlot(element: Element | null = null): Slot {
  return { elements: element === null ? [] : [element] };
}

const makeCellWithGetter = (getElt: (elt: string) => Element) =>
  (elt: string, kind: "header" | "data", x: number, y: number, w: number = 1, h: number = 1): Cell =>
    ({
      kind: kind, anchor: {x: x, y: y}, width: w, height: h, element: getElt(elt), growing: false
    });

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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [makeSlot(getById("first"))],
    [makeSlot(getById("second"))]
  ];

  export const expected: Table = {
    slots: slots,
    // cells: getCells(slots),
    cells: [ makeCell("first","header", 0, 0), makeCell("second","data", 1, 0) ],
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [makeSlot(getById("grade")),
      makeSlot()],
    [makeSlot(getById("yield")),
      makeSlot()],
    [makeSlot(getById("strength"))],
    [makeSlot()],
    [makeSlot(getById("elong")),
      makeSlot()],
    [makeSlot(getById("reduct")),
      makeSlot()]
  ];
  export const expected: Table = {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("grade", "header", 0, 0,1, 2),
      makeCell("yield", "header", 1, 0, 1, 2),
      makeCell("strength", "header", 2, 0, 2, 1),
      makeCell("elong", "header", 4, 0, 1, 2),
      makeCell("reduct", "header", 5, 0, 1, 2)
    ],
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [makeSlot(getById("grade")),
      makeSlot()],
    [makeSlot(getById("yield")),
      makeSlot()],
    [makeSlot(getById("strength")),
      makeSlot(getById("kg-mm"))],
    [makeSlot(),
      makeSlot(getById("lb-in"))],
    [makeSlot(getById("elong")),
      makeSlot()],
    [makeSlot(getById("reduct")),
      makeSlot()]
  ];
  export const expected: Table = {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("grade", "header", 0, 0, 1, 2),
      makeCell("yield", "header", 1, 0, 1, 2),
      makeCell("strength", "header", 2, 0, 2, 1),
      makeCell("elong", "header", 4, 0, 1, 2),
      makeCell("reduct", "header", 5, 0, 1, 2),
      makeCell("kg-mm", "header", 2, 1),
      makeCell("lb-in", "header", 3, 1)
    ],
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [ makeSlot(getById("grade")),
      makeSlot(),
      makeSlot(getById("hard")),
      makeSlot(getById("medium")),
      makeSlot(getById("soft"))
    ],
    [ makeSlot(getById("yield")),
      makeSlot(),
      makeSlot(getById("hard-yield")),
      makeSlot(getById("medium-yield")),
      makeSlot(getById("soft-yield"))
    ],
    [ makeSlot(getById("strength")),
      makeSlot(getById("kg-mm")),
      makeSlot(getById("hard-kg")),
      makeSlot(getById("medium-kg")),
      makeSlot(getById("soft-kg"))
    ],
    [ makeSlot(),
      makeSlot(getById("lb-in")),
      makeSlot(getById("hard-lb")),
      makeSlot(getById("medium-lb")),
      makeSlot(getById("soft-lb")),
    ],
    [ makeSlot(getById("elong")),
      makeSlot(),
      makeSlot(getById("hard-elong")),
      makeSlot(getById("medium-elong")),
      makeSlot(getById("soft-elong")),
    ],
    [ makeSlot(getById("reduct")),
      makeSlot(),
      makeSlot(getById("hard-reduct")),
      makeSlot(getById("medium-reduct")),
      makeSlot(getById("soft-reduct")),
    ]
  ];
  export const expected: Table =  {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("grade", "header", 0, 0, 1, 2), makeCell("yield", "header", 1, 0, 1, 2), makeCell("strength", "header", 2, 0, 2, 1),
      makeCell("elong", "header", 4, 0, 1, 2), makeCell("reduct", "header", 5, 0, 1, 2),
      makeCell("kg-mm", "header", 2, 1), makeCell("lb-in", "header", 3, 1),
      makeCell("hard", "data", 0, 2), makeCell("hard-yield", "data", 1, 2), makeCell("hard-kg", "data", 2, 2),
      makeCell("hard-lb", "data", 3, 2), makeCell("hard-elong", "data", 4, 2), makeCell("hard-reduct", "data", 5, 2),
      makeCell("medium", "data", 0, 3), makeCell("medium-yield", "data", 1, 3), makeCell("medium-kg", "data", 2, 3),
      makeCell("medium-lb", "data", 3, 3), makeCell("medium-elong", "data", 4, 3), makeCell("medium-reduct", "data", 5, 3),
      makeCell("soft", "data", 0, 4), makeCell("soft-yield", "data", 1, 4), makeCell("soft-kg", "data", 2, 4),
      makeCell("soft-lb", "data", 3, 4), makeCell("soft-elong", "data", 4, 4), makeCell("soft-reduct", "data", 5, 4)
    ],
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [ makeSlot(getById("empty")),
      makeSlot(getById("net")),
      makeSlot(getById("cost")),
      makeSlot(getById("margin")),
      makeSlot(getById("percent"))
    ],
    [ makeSlot(getById("2008")),
      makeSlot(getById("net-2008")),
      makeSlot(getById("cost-2008")),
      makeSlot(getById("margin-2008")),
      makeSlot(getById("percent-2008"))
    ],
    [ makeSlot(getById("2007")),
      makeSlot(getById("net-2007")),
      makeSlot(getById("cost-2007")),
      makeSlot(getById("margin-2007")),
      makeSlot(getById("percent-2007"))
    ],
    [ makeSlot(getById("2006")),
      makeSlot(getById("net-2006")),
      makeSlot(getById("cost-2006")),
      makeSlot(getById("margin-2006")),
      makeSlot(getById("percent-2006"))
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("empty", "header", 0, 0), makeCell("2008", "header", 1, 0),
      makeCell("2007", "header", 2, 0), makeCell("2006", "header", 3, 0),
      makeCell("net", "header", 0, 1), makeCell("net-2008", "data", 1, 1),
      makeCell("net-2007", "data", 2, 1), makeCell("net-2006", "data", 3, 1),
      makeCell("cost", "header", 0, 2), makeCell("cost-2008", "data", 1, 2),
      makeCell("cost-2007", "data", 2, 2), makeCell("cost-2006", "data", 3, 2),
      makeCell("margin", "header", 0, 3), makeCell("margin-2008", "data", 1, 3),
      makeCell("margin-2007", "data", 2, 3), makeCell("margin-2006", "data", 3, 3),
      makeCell("percent", "header", 0, 4), makeCell("percent-2008", "data", 1, 4),
      makeCell("percent-2007", "data", 2, 4), makeCell("percent-2006", "data", 3, 4)
    ],
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [ makeSlot(getById("empty")),
      makeSlot(getById("rd")),
      makeSlot(getById("rd-percent")),
      makeSlot(getById("sales")),
      makeSlot(getById("sales-percent")),
    ],
    [ makeSlot(getById("2008")),
      makeSlot(getById("rd-2008")),
      makeSlot(getById("rd-percent-2008")),
      makeSlot(getById("sales-2008")),
      makeSlot(getById("sales-percent-2008")),
    ],
    [ makeSlot(getById("2007")),
      makeSlot(getById("rd-2007")),
      makeSlot(getById("rd-percent-2007")),
      makeSlot(getById("sales-2007")),
      makeSlot(getById("sales-percent-2007")),
    ],
    [ makeSlot(getById("2006")),
      makeSlot(getById("rd-2006")),
      makeSlot(getById("rd-percent-2006")),
      makeSlot(getById("sales-2006")),
      makeSlot(getById("sales-percent-2006")),
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("empty", "header", 0, 0), makeCell("2008", "header", 1, 0),
      makeCell("2007", "header", 2, 0), makeCell("2006", "header", 3, 0),
      makeCell("rd", "header", 0, 1), makeCell("rd-2008", "data", 1, 1),
      makeCell("rd-2007", "data", 2, 1), makeCell("rd-2006", "data", 3, 1),
      makeCell("rd-percent", "header", 0, 2), makeCell("rd-percent-2008", "data", 1, 2),
      makeCell("rd-percent-2007", "data", 2, 2), makeCell("rd-percent-2006", "data", 3, 2),
      makeCell("sales", "header", 0, 3), makeCell("sales-2008", "data", 1, 3),
      makeCell("sales-2007", "data", 2, 3), makeCell("sales-2006", "data", 3, 3),
      makeCell("sales-percent", "header", 0, 4), makeCell("sales-percent-2008", "data", 1, 4),
      makeCell("sales-percent-2007", "data", 2, 4), makeCell("sales-percent-2006", "data", 3, 4),
    ],
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
    <colgroup id="ignored" span={4}></colgroup>
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
  const makeCell = makeCellWithGetter(getById);

  const slots = [
    [ makeSlot(getById("empty")),
      makeSlot(getById("rd")),
      makeSlot(getById("rd-percent")),
      makeSlot(getById("sales")),
      makeSlot(getById("sales-percent")),
    ],
    [ makeSlot(getById("2008")),
      makeSlot(getById("rd-2008")),
      makeSlot(getById("rd-percent-2008")),
      makeSlot(getById("sales-2008")),
      makeSlot(getById("sales-percent-2008")),
    ],
    [ makeSlot(getById("2007")),
      makeSlot(getById("rd-2007")),
      makeSlot(getById("rd-percent-2007")),
      makeSlot(getById("sales-2007")),
      makeSlot(getById("sales-percent-2007")),
    ],
    [ makeSlot(getById("2006")),
      makeSlot(getById("rd-2006")),
      makeSlot(getById("rd-percent-2006")),
      makeSlot(getById("sales-2006")),
      makeSlot(getById("sales-percent-2006")),
    ],
  ];
  export const expected: Table =  {
    slots: slots,
    // cells: getCells(slots),
    cells: [
      makeCell("empty", "header", 0, 0), makeCell("2008", "header", 1, 0),
      makeCell("2007", "header", 2, 0), makeCell("2006", "header", 3, 0),
      makeCell("rd", "header", 0, 1), makeCell("rd-2008", "data", 1, 1),
      makeCell("rd-2007", "data", 2, 1), makeCell("rd-2006", "data", 3, 1),
      makeCell("rd-percent", "header", 0, 2), makeCell("rd-percent-2008", "data", 1, 2),
      makeCell("rd-percent-2007", "data", 2, 2), makeCell("rd-percent-2006", "data", 3, 2),
      makeCell("sales", "header", 0, 3), makeCell("sales-2008", "data", 1, 3),
      makeCell("sales-2007", "data", 2, 3), makeCell("sales-2006", "data", 3, 3),
      makeCell("sales-percent", "header", 0, 4), makeCell("sales-percent-2008", "data", 1, 4),
      makeCell("sales-percent-2007", "data", 2, 4), makeCell("sales-percent-2006", "data", 3, 4),
    ],
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
