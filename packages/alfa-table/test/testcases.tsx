import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Comparable } from "@siteimprove/alfa-comparable";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import {None} from "@siteimprove/alfa-option/src/none";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Cell } from "../src/cell";
import { ColumnGroup } from "../src/column-group";
import { Row } from "../src/row";
import { RowGroup } from "../src/row-group";
import { Scope } from "../src/scope";
import { Table } from "../src/table";

const { and } = Predicate;
const { isElement, hasId } = Element;
const { compare } = Comparable;

const makeCellFromGetter = (getElt: (elt: string) => Element) => (
  elt: string,
  kind: Cell.Kind,
  x: number,
  y: number,
  headers: Array<string> = [],
  variant: Scope.Resolved | undefined = undefined,
  width: number = 1,
  height: number = 1
): Cell =>
  Cell.of(
    kind,
    x,
    y,
    width,
    height,
    getElt(elt),
    Option.from(variant),
    headers.map(getElt)
  );

function toBuildingCell(cell: Cell) {
  return Cell.Builder.of(
    cell.kind,
    cell.anchor.x,
    cell.anchor.y,
    cell.width,
    cell.height,
    cell.element
  );
}

const getDescendantById = (node: Node) => (id: string) =>
  node
    .descendants()
    .find(and(isElement, hasId(id)))
    .get();

function makeSlotArray(
  width: number,
  height: number,
  cells: Array<Cell>
): Array<Array<Option<Cell>>> {
  const slots: Array<Array<Option<Cell>>> = new Array(width);
  for (let x = 0; x < width; x++) {
    slots[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      slots[x][y] = Option.from(cells.find((cell) => cell.isCovering(x, y)));
    }
  }

  return slots;
}

// processing simple row
export namespace simpleRow {
  export const element = Element.fromElement(
    <tr>
      <th id="first">1</th>
      <td id="second">2</td>
    </tr>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = Row.Builder.of(
    0,
    2,
    1,
    element,
    [
      makeCell("first", Cell.Kind.Header, 0, 0),
      makeCell("second", Cell.Kind.Data, 1, 0),
    ]
      .map(toBuildingCell)
      .sort(compare)
  );
}

// Examples taken from https://html.spec.whatwg.org/multipage/tables.html#table-examples

// processing complex row
export namespace complexRow {
  export const element = Element.fromElement(
    <tr>
      <th id="grade" rowSpan={2}>
        Grade.
      </th>
      <th id="yield" rowSpan={2}>
        Yield Point.
      </th>
      <th id="strength" colSpan={2}>
        Ultimate tensile strength
      </th>
      <th id="elong" rowSpan={2}>
        Per cent elong. 50.8mm or 2 in.
      </th>
      <th id="reduct" rowSpan={2}>
        Per cent reduct. area.
      </th>
    </tr>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = Row.Builder.of(
    0,
    6,
    2,
    element,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, [], undefined, 1, 2),
      makeCell("yield", Cell.Kind.Header, 1, 0, [], undefined, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, [], undefined, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, [], undefined, 1, 2),
      makeCell("reduct", Cell.Kind.Header, 5, 0, [], undefined, 1, 2),
    ]
      .map(toBuildingCell)
      .sort(compare)
  );
}

// processing row group
export namespace simpleRowGroup {
  export const element = Element.fromElement(
    <thead id="thead">
      <tr id="first">
        <th id="grade" rowSpan={2}>
          Grade.
        </th>
        <th id="yield" rowSpan={2}>
          Yield Point.
        </th>
        <th id="strength" colSpan={2}>
          Ultimate tensile strength
        </th>
        <th id="elong" rowSpan={2}>
          Per cent elong. 50.8mm or 2 in.
        </th>
        <th id="reduct" rowSpan={2}>
          Per cent reduct. area.
        </th>
      </tr>
      <tr id="second">
        <th id="kg-mm">
          kg/mm<sup>2</sup>
        </th>
        <th id="lb-in">
          lb/in<sup>2</sup>
        </th>
      </tr>
    </thead>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = RowGroup.Builder.of(
    -1,
    2,
    element,
    6,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, [], undefined, 1, 2),
      makeCell("yield", Cell.Kind.Header, 1, 0, [], undefined, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, [], undefined, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, [], undefined, 1, 2),
      makeCell("reduct", Cell.Kind.Header, 5, 0, [], undefined, 1, 2),
      makeCell("kg-mm", Cell.Kind.Header, 2, 1),
      makeCell("lb-in", Cell.Kind.Header, 3, 1),
    ]
      .map(toBuildingCell)
      .sort(compare)
  );
}

// row group with downward growing cells
export namespace downwardGrowing {
  export const element = Element.fromElement(
    <thead id="thead">
      <tr id="first">
        <th id="grade" rowSpan={3}>
          Grade.
        </th>
        <th id="yield" rowSpan={2}>
          Yield Point.
        </th>
        <th id="strength" colSpan={2}>
          Ultimate tensile strength
        </th>
        <th id="elong" rowSpan={2}>
          Per cent elong. 50.8mm or 2 in.
        </th>
        <th id="reduct" rowSpan={0}>
          Per cent reduct. area.
        </th>
      </tr>
      <tr id="second">
        <th id="kg-mm" rowSpan={0}>
          kg/mm<sup>2</sup>
        </th>
        <th id="lb-in">
          lb/in<sup>2</sup>
        </th>
      </tr>
      <tr id="third">
        <th id="foo">foo</th>
        <th id="bar">bar</th>
      </tr>
    </thead>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = RowGroup.Builder.of(
    -1,
    3,
    element,
    6,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, [], undefined, 1, 3),
      makeCell("yield", Cell.Kind.Header, 1, 0, [], undefined, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, [], undefined, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, [], undefined, 1, 2),
      makeCell("lb-in", Cell.Kind.Header, 3, 1),
      makeCell("foo", Cell.Kind.Header, 1, 2, [], undefined, 1, 1),
      makeCell("bar", Cell.Kind.Header, 3, 2, [], undefined, 1, 1),
      makeCell("reduct", Cell.Kind.Header, 5, 0, [], undefined, 1, 3),
      makeCell("kg-mm", Cell.Kind.Header, 2, 1, [], undefined, 1, 2),
    ]
      .map(toBuildingCell)
      .sort(compare)
  );
}

// table with row group, colspan and rowspan
export namespace smithonian {
  export const element = Element.fromElement(
    <table>
      <caption>
        Specification values: <b>Steel</b>, <b>Castings</b>, Ann. A.S.T.M.
        A27-16, Class B;* P max. 0.06; S max. 0.05.
      </caption>
      <thead id="thead">
        <tr>
          <th id="grade" rowSpan={2}>
            Grade.
          </th>
          <th id="yield" rowSpan={2}>
            Yield Point.
          </th>
          <th id="strength" colSpan={2}>
            Ultimate tensile strength
          </th>
          <th id="elong" rowSpan={2}>
            Per cent elong. 50.8mm or 2 in.
          </th>
          <th id="reduct" rowSpan={2}>
            Per cent reduct. area.
          </th>
        </tr>
        <tr>
          <th id="kg-mm">
            kg/mm<sup>2</sup>
          </th>
          <th id="lb-in">
            lb/in<sup>2</sup>
          </th>
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
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("grade", Cell.Kind.Header, 0, 0, [], Scope.Column, 1, 2),
    makeCell("yield", Cell.Kind.Header, 1, 0, [], Scope.Column, 1, 2),
    makeCell("strength", Cell.Kind.Header, 2, 0, [], Scope.Column, 2, 1),
    makeCell("elong", Cell.Kind.Header, 4, 0, [], Scope.Column, 1, 2),
    makeCell("reduct", Cell.Kind.Header, 5, 0, [], Scope.Column, 1, 2),
    makeCell("kg-mm", Cell.Kind.Header, 2, 1, ["strength"], Scope.Column),
    makeCell("lb-in", Cell.Kind.Header, 3, 1, ["strength"], Scope.Column),
    makeCell("hard", Cell.Kind.Data, 0, 2, ["grade"]),
    makeCell("hard-yield", Cell.Kind.Data, 1, 2, ["yield"]),
    makeCell("hard-kg", Cell.Kind.Data, 2, 2, ["kg-mm", "strength"]),
    makeCell("hard-lb", Cell.Kind.Data, 3, 2, ["lb-in", "strength"]),
    makeCell("hard-elong", Cell.Kind.Data, 4, 2, ["elong"]),
    makeCell("hard-reduct", Cell.Kind.Data, 5, 2, ["reduct"]),
    makeCell("medium", Cell.Kind.Data, 0, 3, ["grade"]),
    makeCell("medium-yield", Cell.Kind.Data, 1, 3, ["yield"]),
    makeCell("medium-kg", Cell.Kind.Data, 2, 3, ["kg-mm", "strength"]),
    makeCell("medium-lb", Cell.Kind.Data, 3, 3, ["lb-in", "strength"]),
    makeCell("medium-elong", Cell.Kind.Data, 4, 3, ["elong"]),
    makeCell("medium-reduct", Cell.Kind.Data, 5, 3, ["reduct"]),
    makeCell("soft", Cell.Kind.Data, 0, 4, ["grade"]),
    makeCell("soft-yield", Cell.Kind.Data, 1, 4, ["yield"]),
    makeCell("soft-kg", Cell.Kind.Data, 2, 4, ["kg-mm", "strength"]),
    makeCell("soft-lb", Cell.Kind.Data, 3, 4, ["lb-in", "strength"]),
    makeCell("soft-elong", Cell.Kind.Data, 4, 4, ["elong"]),
    makeCell("soft-reduct", Cell.Kind.Data, 5, 4, ["reduct"]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    6,
    5,
    cells,
    makeSlotArray(6, 5, cells),
    [
      RowGroup.of(0, 2, getById("thead")),
      RowGroup.of(2, 3, getById("tbody")),
    ].sort(compare)
  );
}

// table with a tfoot in the middle
export namespace apple {
  export const element = Element.fromElement(
    <table>
      <thead id="thead">
        <tr id="tr">
          <th id="empty" />
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
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("2008", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCell("2007", Cell.Kind.Header, 2, 0, [], Scope.Column),
    makeCell("2006", Cell.Kind.Header, 3, 0, [], Scope.Column),
    makeCell("net", Cell.Kind.Header, 0, 1, [], Scope.Row),
    makeCell("net-2008", Cell.Kind.Data, 1, 1, ["net", "2008"]),
    makeCell("net-2007", Cell.Kind.Data, 2, 1, ["net", "2007"]),
    makeCell("net-2006", Cell.Kind.Data, 3, 1, ["net", "2006"]),
    makeCell("cost", Cell.Kind.Header, 0, 2, [], Scope.Row),
    makeCell("cost-2008", Cell.Kind.Data, 1, 2, ["cost", "2008"]),
    makeCell("cost-2007", Cell.Kind.Data, 2, 2, ["cost", "2007"]),
    makeCell("cost-2006", Cell.Kind.Data, 3, 2, ["cost", "2006"]),
    makeCell("margin", Cell.Kind.Header, 0, 3, [], Scope.Row),
    makeCell("margin-2008", Cell.Kind.Data, 1, 3, ["margin", "2008"]),
    makeCell("margin-2007", Cell.Kind.Data, 2, 3, ["margin", "2007"]),
    makeCell("margin-2006", Cell.Kind.Data, 3, 3, ["margin", "2006"]),
    makeCell("percent", Cell.Kind.Header, 0, 4, [], Scope.Row),
    makeCell("percent-2008", Cell.Kind.Data, 1, 4, ["percent", "2008"]),
    makeCell("percent-2007", Cell.Kind.Data, 2, 4, ["percent", "2007"]),
    makeCell("percent-2006", Cell.Kind.Data, 3, 4, ["percent", "2006"]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    4,
    5,
    cells,
    makeSlotArray(4, 5, cells),
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 1, getById("body-2")),
      RowGroup.of(4, 1, getById("tfoot")),
    ].sort(compare)
  );
}

// example with colgroup
export namespace expenses {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-head">
        <col />
      </colgroup>
      <colgroup id="group-body">
        <col /> <col /> <col />
      </colgroup>
      <thead id="thead">
        <tr>
          <th id="empty" /> <th id="2008">2008</th> <th id="2007">2007</th>
          <th id="2006">2006</th>
        </tr>
      </thead>
      <tbody id="body-1">
        <tr>
          <th id="rd" scope="rowgroup">
            Research and development
          </th>
          <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td>
          <td id="rd-2006">$ 712</td>
        </tr>
        <tr>
          <th id="rd-percent" scope="row">
            Percentage of net sales
          </th>
          <td id="rd-percent-2008">3.4%</td> <td id="rd-percent-2007">3.3%</td>
          <td id="rd-percent-2006">3.7%</td>
        </tr>
      </tbody>
      <tbody id="body-2">
        <tr>
          <th id="sales" scope="rowgroup">
            Selling, general, and administrative
          </th>
          <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td>
          <td id="sales-2006">$ 2,433</td>
        </tr>
        <tr>
          <th id="sales-percent" scope="row">
            Percentage of net sales
          </th>
          <td id="sales-percent-2008">11.6%</td>
          <td id="sales-percent-2007">12.3%</td>
          <td id="sales-percent-2006">12.6%</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("2008", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCell("2007", Cell.Kind.Header, 2, 0, [], Scope.Column),
    makeCell("2006", Cell.Kind.Header, 3, 0, [], Scope.Column),
    makeCell("rd", Cell.Kind.Header, 0, 1, [], Scope.RowGroup),
    makeCell("rd-2008", Cell.Kind.Data, 1, 1, ["2008", "rd"]),
    makeCell("rd-2007", Cell.Kind.Data, 2, 1, ["2007", "rd"]),
    makeCell("rd-2006", Cell.Kind.Data, 3, 1, ["2006", "rd"]),
    makeCell("rd-percent", Cell.Kind.Header, 0, 2, ["rd"], Scope.Row),
    makeCell("rd-percent-2008", Cell.Kind.Data, 1, 2, [
      "rd-percent",
      "2008",
      "rd",
    ]),
    makeCell("rd-percent-2007", Cell.Kind.Data, 2, 2, [
      "rd-percent",
      "2007",
      "rd",
    ]),
    makeCell("rd-percent-2006", Cell.Kind.Data, 3, 2, [
      "rd-percent",
      "2006",
      "rd",
    ]),
    makeCell("sales", Cell.Kind.Header, 0, 3, [], Scope.RowGroup),
    makeCell("sales-2008", Cell.Kind.Data, 1, 3, ["2008", "sales"]),
    makeCell("sales-2007", Cell.Kind.Data, 2, 3, ["2007", "sales"]),
    makeCell("sales-2006", Cell.Kind.Data, 3, 3, ["2006", "sales"]),
    makeCell("sales-percent", Cell.Kind.Header, 0, 4, ["sales"], Scope.Row),
    makeCell("sales-percent-2008", Cell.Kind.Data, 1, 4, [
      "sales-percent",
      "2008",
      "sales",
    ]),
    makeCell("sales-percent-2007", Cell.Kind.Data, 2, 4, [
      "sales-percent",
      "2007",
      "sales",
    ]),
    makeCell("sales-percent-2006", Cell.Kind.Data, 3, 4, [
      "sales-percent",
      "2006",
      "sales",
    ]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    4,
    5,
    cells,
    makeSlotArray(4, 5, cells),
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 2, getById("body-2")),
    ].sort(compare),
    [
      ColumnGroup.of(0, 1, getById("group-head")),
      ColumnGroup.of(1, 3, getById("group-body")),
    ].sort(compare)
  );

  export const headerVariants = [
    Scope.Column,
    Scope.Column,
    Scope.Column,
    Scope.Column, // first row, auto => column
    Scope.RowGroup,
    Scope.Row,
    Scope.RowGroup,
    Scope.Row, // explicitly set
  ];
}

// same with colgroup defined by spans
export namespace expensesNum {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-head" span={1} />
      <colgroup id="group-body">
        <col span={2} /> <col />
      </colgroup>
      <thead id="thead">
        <tr>
          <th id="empty" /> <th id="2008">2008</th> <th id="2007">2007</th>
          <th id="2006">2006</th>
        </tr>
      </thead>
      <tbody id="body-1">
        <tr>
          <th id="rd" scope="rowgroup">
            Research and development
          </th>
          <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td>
          <td id="rd-2006">$ 712</td>
        </tr>
        <tr>
          <th id="rd-percent" scope="row">
            Percentage of net sales
          </th>
          <td id="rd-percent-2008">3.4%</td> <td id="rd-percent-2007">3.3%</td>
          <td id="rd-percent-2006">3.7%</td>
        </tr>
      </tbody>
      <colgroup id="ignored" span={4} />
      <tbody id="body-2">
        <tr>
          <th id="sales" scope="rowgroup">
            Selling, general, and administrative
          </th>
          <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td>
          <td id="sales-2006">$ 2,433</td>
        </tr>
        <tr>
          <th id="sales-percent" scope="row">
            Percentage of net sales
          </th>
          <td id="sales-percent-2008">11.6%</td>
          <td id="sales-percent-2007">12.3%</td>
          <td id="sales-percent-2006">12.6%</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("2008", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCell("2007", Cell.Kind.Header, 2, 0, [], Scope.Column),
    makeCell("2006", Cell.Kind.Header, 3, 0, [], Scope.Column),
    makeCell("rd", Cell.Kind.Header, 0, 1, [], Scope.RowGroup),
    makeCell("rd-2008", Cell.Kind.Data, 1, 1, ["2008", "rd"]),
    makeCell("rd-2007", Cell.Kind.Data, 2, 1, ["2007", "rd"]),
    makeCell("rd-2006", Cell.Kind.Data, 3, 1, ["2006", "rd"]),
    makeCell("rd-percent", Cell.Kind.Header, 0, 2, ["rd"], Scope.Row),
    makeCell("rd-percent-2008", Cell.Kind.Data, 1, 2, [
      "rd-percent",
      "2008",
      "rd",
    ]),
    makeCell("rd-percent-2007", Cell.Kind.Data, 2, 2, [
      "rd-percent",
      "2007",
      "rd",
    ]),
    makeCell("rd-percent-2006", Cell.Kind.Data, 3, 2, [
      "rd-percent",
      "2006",
      "rd",
    ]),
    makeCell("sales", Cell.Kind.Header, 0, 3, [], Scope.RowGroup),
    makeCell("sales-2008", Cell.Kind.Data, 1, 3, ["2008", "sales"]),
    makeCell("sales-2007", Cell.Kind.Data, 2, 3, ["2007", "sales"]),
    makeCell("sales-2006", Cell.Kind.Data, 3, 3, ["2006", "sales"]),
    makeCell("sales-percent", Cell.Kind.Header, 0, 4, ["sales"], Scope.Row),
    makeCell("sales-percent-2008", Cell.Kind.Data, 1, 4, [
      "sales-percent",
      "2008",
      "sales",
    ]),
    makeCell("sales-percent-2007", Cell.Kind.Data, 2, 4, [
      "sales-percent",
      "2007",
      "sales",
    ]),
    makeCell("sales-percent-2006", Cell.Kind.Data, 3, 4, [
      "sales-percent",
      "2006",
      "sales",
    ]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    4,
    5,
    cells,
    makeSlotArray(4, 5, cells),
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 2, getById("body-2")),
    ].sort(compare),
    [
      ColumnGroup.of(0, 1, getById("group-head")),
      ColumnGroup.of(1, 3, getById("group-body")),
    ].sort(compare)
  );
}

export namespace errors {
  // second column (column 1) has no cell anchored in it.
  export const emptyCol = Element.fromElement(
    <table>
      <tr>
        <td id="one-two" colSpan={2}>
          2 columns
        </td>
        <td id="three">third column</td>
      </tr>
    </table>
  );

  // second row (row 1) has no cell anchored in it.
  export const emptyRow = Element.fromElement(
    <table>
      <tr>
        <td rowSpan={2}>2 rows</td>
      </tr>
      <tr />
      <tr>
        <td>third row</td>
      </tr>
    </table>
  );

  // slot (1, 1) is covered twice
  export const coveredTwice = Element.fromElement(
    <table>
      <tr>
        <td>1 row, 1 col</td>
        <td rowSpan={2}>2 rows</td>
      </tr>
      <tr>
        <td colSpan={2}>2 cols</td>
      </tr>
    </table>
  );
}

export namespace headersVariant {
  /*
  C | R |
  N |   | D
  C | C | C | C
  C
  D | R
  C | C
   */
  export const element = Element.fromElement(
    <table>
      <thead id="thead">
        <tr id="row1">
          <th id="c11">column</th>
          <th id="c21" rowspan={2}>
            row because of 32
          </th>
        </tr>
        <tr id="row2">
          <th id="c12">nothing because of 32 and 15</th>
          <td id="c32">prevents 21 and 12 from being column</td>
        </tr>
        <tr id="row3">
          <th id="c13">column</th>
          <th id="c23">column</th>
          <th id="c33">column</th>
          <th id="c43">column</th>
        </tr>
      </thead>
      <tbody id="tbody">
        <tr id="row4">
          <th id="c14">column</th>
        </tr>
        <tr id="row5">
          <td id="c15">prevent 12 from being row and 25 from being column</td>
          <th id="c25">row</th>
        </tr>
        <tr id="row6">
          <th id="c16">column</th>
          <th id="c26">column</th>
        </tr>
      </tbody>
    </table>
  );

  export const headerVariants = [
    Scope.Column,
    Scope.Row,
    undefined,
    Scope.Column,
    Scope.Column,
    Scope.Column,
    Scope.Column,
    Scope.Column,
    Scope.Row,
    Scope.Column,
    Scope.Column,
  ].map(Option.from);
}

export namespace explicitHeaders {
  export const element = Element.fromElement(
    <table>
      <tr>
        <th id="text-content">not empty</th>
        <th id="child">
          <span id="not-empty" />
        </th>
        <th id="empty" />
        <td id="data">Data cell can actually be header</td>
      </tr>
      <tr>
        <td id="foo" headers="text-content child empty data">
          Foo
        </td>
      </tr>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("text-content", Cell.Kind.Header, 0, 0),
    makeCell("child", Cell.Kind.Header, 1, 0, [], Scope.Row),
    makeCell("empty", Cell.Kind.Header, 2, 0, ["child"], Scope.Row),
    makeCell("data", Cell.Kind.Data, 3, 0, ["child"]),
    makeCell("foo", Cell.Kind.Data, 0, 1, ["text-content", "child", "data"]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    4,
    2,
    cells,
    makeSlotArray(4, 2, cells)
  );
}

// correctly selecting explicit header when multiple element have the same id.
export namespace duplicateIDExplicitHeaders {
  export const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <body>
          <span id="dup-out" />
          <table id="table">
            <tr>
              <th id="dup-out" /> <th id="dup-in">First</th>{" "}
              <th id="dup-in">Second</th>
            </tr>
            <tr>
              <td id="data-1" headers="dup-out" />{" "}
              <td id="data-2" headers="dup-in" />
            </tr>
          </table>
        </body>
      </html>,
      Option.of(self)
    ),
  ]);
  export const table = getDescendantById(document)("table");
  const getById = getDescendantById(table);
  const makeCell = makeCellFromGetter(getById);
  const lastHeader = table
    .descendants()
    .filter(
      and(isElement, (element) =>
        element
          .attribute("id")
          .map((attr) => attr.value === "dup-in")
          .getOr(false)
      )
    )
    .rest()
    .first()
    .get();

  const cells = [
    makeCell("dup-out", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("dup-in", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCellFromGetter((_) => lastHeader)(
      "",
      Cell.Kind.Header,
      2,
      0,
      [],
      Scope.Column
    ),
    makeCell("data-1", Cell.Kind.Data, 0, 1), // no header because first with correct id is out of table
    makeCell("data-2", Cell.Kind.Data, 1, 1, ["dup-in"]),
  ].sort(compare);
  export const expected = Table.of(
    table,
    3,
    2,
    cells,
    makeSlotArray(3, 2, cells)
  );
}

export namespace simpleImplicitHeaders {
  export const element = Element.fromElement(
    <table>
      <tr>
        <th id="empty" />
        <th id="col1">First column</th>
        <th id="col2">Second Column</th>
      </tr>
      <tr>
        <th id="row1">First row</th>
        <td id="cell11">Foo</td>
        <td id="cell12">Bar</td>
      </tr>
      <tr>
        <th id="row2">Second row</th>
        <td id="cell21">Foo</td>
        <td id="cell22">Bar</td>
      </tr>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("col1", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCell("col2", Cell.Kind.Header, 2, 0, [], Scope.Column),
    makeCell("row1", Cell.Kind.Header, 0, 1, [], Scope.Row),
    makeCell("cell11", Cell.Kind.Data, 1, 1, ["row1", "col1"]),
    makeCell("cell12", Cell.Kind.Data, 2, 1, ["row1", "col2"]),
    makeCell("row2", Cell.Kind.Header, 0, 2, [], Scope.Row),
    makeCell("cell21", Cell.Kind.Data, 1, 2, ["row2", "col1"]),
    makeCell("cell22", Cell.Kind.Data, 2, 2, ["row2", "col2"]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    3,
    3,
    cells,
    makeSlotArray(3, 3, cells)
  );
}

//
export namespace rowGroupImplicitHeaders {
  export const element = Element.fromElement(
    <table>
      <thead id="thead">
        <tr>
          <th id="ID">ID</th> <th id="measurement">Measurement</th>{" "}
          <th id="average">Average</th> <th id="maximum">Maximum</th>
        </tr>
      </thead>
      <tbody id="tbody-1">
        <tr>
          <td id="empty-cat-id" />
          <th id="cat" scope="rowgroup">
            Cats
          </th>
          <td id="empty-cat-av" /> <td id="empty-cat-max" />
        </tr>
        <tr>
          <td id="id93">93</td>
          <th id="cat-legs" scope="row">
            Legs
          </th>
          <td id="cat-legs-av">3.5</td> <td id="cat-legs-max">4</td>
        </tr>
        <tr>
          <td id="id10">10</td>
          <th id="cat-tails" scope="row">
            Tails
          </th>
          <td id="cat-tails-av">1</td> <td id="cat-tails-max">1</td>
        </tr>
      </tbody>
      <tbody id="tbody-2">
        <tr>
          <td id="empty-en-id" />
          <th id="en" scope="rowgroup">
            English speakers
          </th>
          <td id="empty-en-av" />
          <td id="empty-en-max" />
        </tr>
        <tr>
          <td id="id32">32</td>
          <th id="en-legs" scope="row">
            Legs
          </th>
          <td id="en-legs-av">2.67</td> <td id="en-legs-max">4</td>
        </tr>
        <tr>
          <td id="id35">35</td>
          <th id="en-tails" scope="row">
            Tails
          </th>
          <td id="en-tails-av">0.33</td> <td id="en-tails-max">1</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("ID", Cell.Kind.Header, 0, 0, [], Scope.Column),
    makeCell("measurement", Cell.Kind.Header, 1, 0, [], Scope.Column),
    makeCell("average", Cell.Kind.Header, 2, 0, [], Scope.Column),
    makeCell("maximum", Cell.Kind.Header, 3, 0, [], Scope.Column),
    makeCell("empty-cat-id", Cell.Kind.Data, 0, 1, ["ID"]),
    makeCell("cat", Cell.Kind.Header, 1, 1, ["measurement"], Scope.RowGroup),
    makeCell("empty-cat-av", Cell.Kind.Data, 2, 1, ["average", "cat"]),
    makeCell("empty-cat-max", Cell.Kind.Data, 3, 1, ["maximum", "cat"]),
    makeCell("id93", Cell.Kind.Data, 0, 2, ["ID"]),
    makeCell(
      "cat-legs",
      Cell.Kind.Header,
      1,
      2,
      ["measurement", "cat"],
      Scope.Row
    ),
    makeCell("cat-legs-av", Cell.Kind.Data, 2, 2, [
      "cat-legs",
      "average",
      "cat",
    ]),
    makeCell("cat-legs-max", Cell.Kind.Data, 3, 2, [
      "cat-legs",
      "maximum",
      "cat",
    ]),
    makeCell("id10", Cell.Kind.Data, 0, 3, ["ID"]),
    makeCell(
      "cat-tails",
      Cell.Kind.Header,
      1,
      3,
      ["measurement", "cat"],
      Scope.Row
    ),
    makeCell("cat-tails-av", Cell.Kind.Data, 2, 3, [
      "cat-tails",
      "average",
      "cat",
    ]),
    makeCell("cat-tails-max", Cell.Kind.Data, 3, 3, [
      "cat-tails",
      "maximum",
      "cat",
    ]),
    makeCell("empty-en-id", Cell.Kind.Data, 0, 4, ["ID"]),
    makeCell("en", Cell.Kind.Header, 1, 4, ["measurement"], Scope.RowGroup),
    makeCell("empty-en-av", Cell.Kind.Data, 2, 4, ["average", "en"]),
    makeCell("empty-en-max", Cell.Kind.Data, 3, 4, ["maximum", "en"]),
    makeCell("id32", Cell.Kind.Data, 0, 5, ["ID"]),
    makeCell(
      "en-legs",
      Cell.Kind.Header,
      1,
      5,
      ["measurement", "en"],
      Scope.Row
    ),
    makeCell("en-legs-av", Cell.Kind.Data, 2, 5, [
      "en-legs",
      "average",
      "en",
    ]),
    makeCell("en-legs-max", Cell.Kind.Data, 3, 5, [
      "en-legs",
      "maximum",
      "en",
    ]),
    makeCell("id35", Cell.Kind.Data, 0, 6, ["ID"]),
    makeCell(
      "en-tails",
      Cell.Kind.Header,
      1,
      6,
      ["measurement", "en"],
      Scope.Row
    ),
    makeCell("en-tails-av", Cell.Kind.Data, 2, 6, [
      "en-tails",
      "average",
      "en",
    ]),
    makeCell("en-tails-max", Cell.Kind.Data, 3, 6, [
      "en-tails",
      "maximum",
      "en",
    ]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    4,
    7,
    cells,
    makeSlotArray(4, 7, cells),
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 3, getById("tbody-1")),
      RowGroup.of(4, 3, getById("tbody-2")),
    ].sort(compare),
    []
  );
}

// https://www.w3.org/WAI/tutorials/tables/irregular/
export namespace colGroupImplicitHeaders {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-empty" />
      <colgroup id="group-mars" span={2} />
      <colgroup id="group-venus" span={2} />
      <tr>
        <td id="empty" rowSpan={2} />
        <th id="mars" colSpan={2} scope="colgroup">
          Mars
        </th>
        <th id="venus" colSpan={2} scope="colgroup">
          Venus
        </th>
      </tr>
      <tr>
        <th id="mars-produced" scope="col">
          Produced
        </th>
        <th id="mars-sold" scope="col">
          Sold
        </th>
        <th id="venus-produced" scope="col">
          Produced
        </th>
        <th id="venus-sold" scope="col">
          Sold
        </th>
      </tr>
      <tr>
        <th id="bears" scope="row">
          Teddy Bears
        </th>
        <td id="mars-produced-bears">50,000</td>
        <td id="mars-sold-bears">30,000</td>
        <td id="venus-produced-bears">100,000</td>
        <td id="venus-sold-bears">80,000</td>
      </tr>
      <tr>
        <th id="games" scope="row">
          Board Games
        </th>
        <td id="mars-produced-games">10,000</td>
        <td id="mars-sold-games">5,000</td>
        <td id="venus-produced-games">12,000</td>
        <td id="venus-sold-games">9,000</td>
      </tr>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Data, 0, 0, [], undefined, 1, 2),
    makeCell("mars", Cell.Kind.Header, 1, 0, [], Scope.ColumnGroup, 2, 1),
    makeCell("venus", Cell.Kind.Header, 3, 0, [], Scope.ColumnGroup, 2, 1),
    makeCell("mars-produced", Cell.Kind.Header, 1, 1, ["mars"], Scope.Column),
    makeCell("mars-sold", Cell.Kind.Header, 2, 1, ["mars"], Scope.Column),
    makeCell(
      "venus-produced",
      Cell.Kind.Header,
      3,
      1,
      ["venus"],
      Scope.Column
    ),
    makeCell("venus-sold", Cell.Kind.Header, 4, 1, ["venus"], Scope.Column),
    makeCell("bears", Cell.Kind.Header, 0, 2, [], Scope.Row),
    makeCell("mars-produced-bears", Cell.Kind.Data, 1, 2, [
      "bears",
      "mars-produced",
      "mars",
    ]),
    makeCell("mars-sold-bears", Cell.Kind.Data, 2, 2, [
      "bears",
      "mars-sold",
      "mars",
    ]),
    makeCell("venus-produced-bears", Cell.Kind.Data, 3, 2, [
      "bears",
      "venus-produced",
      "venus",
    ]),
    makeCell("venus-sold-bears", Cell.Kind.Data, 4, 2, [
      "bears",
      "venus-sold",
      "venus",
    ]),
    makeCell("games", Cell.Kind.Header, 0, 3, [], Scope.Row),
    makeCell("mars-produced-games", Cell.Kind.Data, 1, 3, [
      "games",
      "mars-produced",
      "mars",
    ]),
    makeCell("mars-sold-games", Cell.Kind.Data, 2, 3, [
      "games",
      "mars-sold",
      "mars",
    ]),
    makeCell("venus-produced-games", Cell.Kind.Data, 3, 3, [
      "games",
      "venus-produced",
      "venus",
    ]),
    makeCell("venus-sold-games", Cell.Kind.Data, 4, 3, [
      "games",
      "venus-sold",
      "venus",
    ]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    5,
    4,
    cells,
    makeSlotArray(5, 4, cells),
    [],
    [
      ColumnGroup.of(0, 1, getById("group-empty")),
      ColumnGroup.of(1, 2, getById("group-mars")),
      ColumnGroup.of(3, 2, getById("group-venus")),
    ].sort(compare)
  );
}

// A crazy one with a bit of everything
export namespace allWeirdImplicitHeaders {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-empty">
        <col />
        <col />
      </colgroup>
      <colgroup id="group-mars" span={3} />
      <colgroup id="group-venus" span={2} />
      <thead id="thead">
        <tr>
          <th id="empty" rowSpan={2} colSpan={2} />
          <th id="mars" rowSpan={2} scope="colgroup">
            Mars
          </th>
          <th id="mars-produced" rowSpan={2} scope="col">
            Produced
          </th>
          <th id="mars-sold" rowSpan={2} scope="col">
            Sold
          </th>
          <th id="venus" colSpan={2} scope="colgroup">
            Venus
          </th>
        </tr>
        <tr>
          <th id="venus-produced" scope="col">
            Produced
          </th>
          <th id="venus-sold" scope="col">
            Sold
          </th>
        </tr>
      </thead>
      <tbody id="stuffed-animals">
        <tr>
          <th id="stuffed" rowSpan={2} scope="rowgroup">
            Stuffed animals
          </th>
          <th id="bears">Bears</th>
          <td id="mars-empty-bears" />
          <td id="mars-produced-bears">50,000</td>
          <td id="mars-sold-bears">30,000</td>
          <td id="venus-produced-bears">100,000</td>
          <td id="venus-sold-bears">80,000</td>
        </tr>
        <tr>
          <th id="bunnies">Bunnies</th>
          <td id="mars-empty-bunnies" />
          <td id="mars-produced-bunnies">50,000</td>
          <td id="mars-sold-bunnies">30,000</td>
          <td id="venus-produced-bunnies">100,000</td>
          <td id="venus-sold-bunnies">80,000</td>
        </tr>
      </tbody>
      <tbody id="games-rg">
        <tr>
          <th id="games" colSpan={2} scope="rowgroup">
            Games
          </th>
          <td id="mars-empty-games" />
          <td id="mars-produced-games" />
          <td id="mars-sold-games" />
          <td id="venus-produced-games" />
          <td id="venus-sold-games" />
        </tr>
        <tr>
          <th id="board" colSpan={2} scope="row">
            Board Games
          </th>
          <td id="mars-empty-board" />
          <td id="mars-produced-board">10,000</td>
          <td id="mars-sold-board">5,000</td>
          <td id="venus-produced-board">12,000</td>
          <td id="venus-sold-board">9,000</td>
        </tr>
        <tr>
          <th id="cards" colSpan={2} scope="row">
            Cards Games
          </th>
          <td id="mars-empty-cards" />
          <td id="mars-produced-cards">10,000</td>
          <td id="mars-sold-cards">5,000</td>
          <td id="venus-produced-cards">12,000</td>
          <td id="venus-sold-cards">9,000</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  const cells = [
    makeCell("empty", Cell.Kind.Header, 0, 0, [], Scope.Column, 2, 2),
    makeCell("mars", Cell.Kind.Header, 2, 0, [], Scope.ColumnGroup, 1, 2),
    makeCell(
      "mars-produced",
      Cell.Kind.Header,
      3,
      0,
      ["mars"],
      Scope.Column,
      1,
      2
    ),
    makeCell(
      "mars-sold",
      Cell.Kind.Header,
      4,
      0,
      ["mars"],
      Scope.Column,
      1,
      2
    ),
    makeCell("venus", Cell.Kind.Header, 5, 0, [], Scope.ColumnGroup, 2, 1),
    makeCell(
      "venus-produced",
      Cell.Kind.Header,
      5,
      1,
      ["venus"],
      Scope.Column
    ),
    makeCell("venus-sold", Cell.Kind.Header, 6, 1, ["venus"], Scope.Column),
    makeCell("stuffed", Cell.Kind.Header, 0, 2, [], Scope.RowGroup, 1, 2),
    makeCell("bears", Cell.Kind.Header, 1, 2, ["stuffed"], Scope.Row),
    makeCell("mars-empty-bears", Cell.Kind.Data, 2, 2, [
      "bears",
      "stuffed",
      "mars",
    ]),
    makeCell("mars-produced-bears", Cell.Kind.Data, 3, 2, [
      "bears",
      "mars-produced",
      "stuffed",
      "mars",
    ]),
    makeCell("mars-sold-bears", Cell.Kind.Data, 4, 2, [
      "bears",
      "mars-sold",
      "stuffed",
      "mars",
    ]),
    makeCell("venus-produced-bears", Cell.Kind.Data, 5, 2, [
      "bears",
      "venus-produced",
      "stuffed",
      "venus",
    ]),
    makeCell("venus-sold-bears", Cell.Kind.Data, 6, 2, [
      "bears",
      "venus-sold",
      "stuffed",
      "venus",
    ]),
    makeCell("bunnies", Cell.Kind.Header, 1, 3, ["stuffed"], Scope.Row),
    makeCell("mars-empty-bunnies", Cell.Kind.Data, 2, 3, [
      "bunnies",
      "stuffed",
      "mars",
    ]),
    makeCell("mars-produced-bunnies", Cell.Kind.Data, 3, 3, [
      "bunnies",
      "mars-produced",
      "stuffed",
      "mars",
    ]),
    makeCell("mars-sold-bunnies", Cell.Kind.Data, 4, 3, [
      "bunnies",
      "mars-sold",
      "stuffed",
      "mars",
    ]),
    makeCell("venus-produced-bunnies", Cell.Kind.Data, 5, 3, [
      "bunnies",
      "venus-produced",
      "stuffed",
      "venus",
    ]),
    makeCell("venus-sold-bunnies", Cell.Kind.Data, 6, 3, [
      "bunnies",
      "venus-sold",
      "stuffed",
      "venus",
    ]),
    makeCell("games", Cell.Kind.Header, 0, 4, [], Scope.RowGroup, 2, 1),
    makeCell("mars-empty-games", Cell.Kind.Data, 2, 4, ["games", "mars"]),
    makeCell("mars-produced-games", Cell.Kind.Data, 3, 4, [
      "mars-produced",
      "games",
      "mars",
    ]),
    makeCell("mars-sold-games", Cell.Kind.Data, 4, 4, [
      "mars-sold",
      "games",
      "mars",
    ]),
    makeCell("venus-produced-games", Cell.Kind.Data, 5, 4, [
      "venus-produced",
      "games",
      "venus",
    ]),
    makeCell("venus-sold-games", Cell.Kind.Data, 6, 4, [
      "venus-sold",
      "games",
      "venus",
    ]),
    makeCell("board", Cell.Kind.Header, 0, 5, ["games"], Scope.Row, 2, 1),
    makeCell("mars-empty-board", Cell.Kind.Data, 2, 5, [
      "board",
      "games",
      "mars",
    ]),
    makeCell("mars-produced-board", Cell.Kind.Data, 3, 5, [
      "board",
      "mars-produced",
      "games",
      "mars",
    ]),
    makeCell("mars-sold-board", Cell.Kind.Data, 4, 5, [
      "board",
      "mars-sold",
      "games",
      "mars",
    ]),
    makeCell("venus-produced-board", Cell.Kind.Data, 5, 5, [
      "board",
      "venus-produced",
      "games",
      "venus",
    ]),
    makeCell("venus-sold-board", Cell.Kind.Data, 6, 5, [
      "board",
      "venus-sold",
      "games",
      "venus",
    ]),
    makeCell("cards", Cell.Kind.Header, 0, 6, ["games"], Scope.Row, 2, 1),
    makeCell("mars-empty-cards", Cell.Kind.Data, 2, 6, [
      "cards",
      "games",
      "mars",
    ]),
    makeCell("mars-produced-cards", Cell.Kind.Data, 3, 6, [
      "cards",
      "mars-produced",
      "games",
      "mars",
    ]),
    makeCell("mars-sold-cards", Cell.Kind.Data, 4, 6, [
      "cards",
      "mars-sold",
      "games",
      "mars",
    ]),
    makeCell("venus-produced-cards", Cell.Kind.Data, 5, 6, [
      "cards",
      "venus-produced",
      "games",
      "venus",
    ]),
    makeCell("venus-sold-cards", Cell.Kind.Data, 6, 6, [
      "cards",
      "venus-sold",
      "games",
      "venus",
    ]),
  ].sort(compare);
  export const expected = Table.of(
    element,
    7,
    7,
    cells,
    makeSlotArray(7, 7, cells),
    [
      RowGroup.of(0, 2, getById("thead")),
      RowGroup.of(2, 2, getById("stuffed-animals")),
      RowGroup.of(4, 3, getById("games-rg")),
    ].sort(compare),
    [
      ColumnGroup.of(0, 2, getById("group-empty")),
      ColumnGroup.of(2, 3, getById("group-mars")),
      ColumnGroup.of(5, 2, getById("group-venus")),
    ].sort(compare)
  );
}
