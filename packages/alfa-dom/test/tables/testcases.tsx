import {None, Option} from "@siteimprove/alfa-option";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Element, Table } from "../../src";
import {
  BuildingCell,
  BuildingRowGroup,
  Cell,
  ColGroup,
  BuildingRow,
  RowGroup, Header,
} from "../../src/tables/groups";

const { and } = Predicate;

const makeCellFromGetter = (getElt: (elt: string) => Element) => (
  elt: string,
  kind: Cell.Kind,
  x: number,
  y: number,
  w: number = 1,
  h: number = 1
): Cell => Cell.of(kind, x, y, w, h, getElt(elt));

function toBuildingCell(cell: Cell) {
  return BuildingCell.of(
    cell.kind,
    cell.anchor.x,
    cell.anchor.y,
    cell.width,
    cell.height,
    cell.element
  );
}

function hasID(id: string): Predicate<Element> {
  return (element) => {
    const idAttr = element.attribute("id");
    return idAttr.isSome() ? idAttr.get().value === id : false;
  };
}

const dummy = Element.of(None, None, "dummy");
const getDescendantById = (element: Element) => (id: string) =>
  element
    .descendants()
    .filter(and(Element.isElement, hasID(id)))
    .first()
    .getOr(dummy);

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

  export const expected = BuildingRow.of(
    0,
    2,
    1,
    element,
    [makeCell("first", Cell.Kind.Header, 0, 0), makeCell("second", Cell.Kind.Data, 1, 0)].map(
      toBuildingCell
    )
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

  export const expected = BuildingRow.of(
    0,
    6,
    2,
    element,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, 1, 2),
      makeCell("yield", Cell.Kind.Header, 1, 0, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, 1, 2),
      makeCell("reduct", Cell.Kind.Header, 5, 0, 1, 2),
    ].map(toBuildingCell)
  );
}

// processing row group
export namespace rowGroup {
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

  export const expected = BuildingRowGroup.of(
    -1,
    2,
    element,
    6,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, 1, 2),
      makeCell("yield", Cell.Kind.Header, 1, 0, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, 1, 2),
      makeCell("reduct", Cell.Kind.Header, 5, 0, 1, 2),
      makeCell("kg-mm", Cell.Kind.Header, 2, 1),
      makeCell("lb-in", Cell.Kind.Header, 3, 1),
    ].map(toBuildingCell)
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

  export const expected = BuildingRowGroup.of(
    -1,
    3,
    element,
    6,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, 1, 3),
      makeCell("yield", Cell.Kind.Header, 1, 0, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, 1, 2),
      makeCell("lb-in", Cell.Kind.Header, 3, 1),
      makeCell("foo", Cell.Kind.Header, 1, 2, 1, 1),
      makeCell("bar", Cell.Kind.Header, 3, 2, 1, 1),
      makeCell("reduct", Cell.Kind.Header, 5, 0, 1, 3),
      makeCell("kg-mm", Cell.Kind.Header, 2, 1, 1, 2),
    ].map(toBuildingCell)
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

  export const expected = Table.of(
    element,
    6,
    5,
    [
      makeCell("grade", Cell.Kind.Header, 0, 0, 1, 2),
      makeCell("yield", Cell.Kind.Header, 1, 0, 1, 2),
      makeCell("strength", Cell.Kind.Header, 2, 0, 2, 1),
      makeCell("elong", Cell.Kind.Header, 4, 0, 1, 2),
      makeCell("reduct", Cell.Kind.Header, 5, 0, 1, 2),
      makeCell("kg-mm", Cell.Kind.Header, 2, 1),
      makeCell("lb-in", Cell.Kind.Header, 3, 1),
      makeCell("hard", Cell.Kind.Data, 0, 2),
      makeCell("hard-yield", Cell.Kind.Data, 1, 2),
      makeCell("hard-kg", Cell.Kind.Data, 2, 2),
      makeCell("hard-lb", Cell.Kind.Data, 3, 2),
      makeCell("hard-elong", Cell.Kind.Data, 4, 2),
      makeCell("hard-reduct", Cell.Kind.Data, 5, 2),
      makeCell("medium", Cell.Kind.Data, 0, 3),
      makeCell("medium-yield", Cell.Kind.Data, 1, 3),
      makeCell("medium-kg", Cell.Kind.Data, 2, 3),
      makeCell("medium-lb", Cell.Kind.Data, 3, 3),
      makeCell("medium-elong", Cell.Kind.Data, 4, 3),
      makeCell("medium-reduct", Cell.Kind.Data, 5, 3),
      makeCell("soft", Cell.Kind.Data, 0, 4),
      makeCell("soft-yield", Cell.Kind.Data, 1, 4),
      makeCell("soft-kg", Cell.Kind.Data, 2, 4),
      makeCell("soft-lb", Cell.Kind.Data, 3, 4),
      makeCell("soft-elong", Cell.Kind.Data, 4, 4),
      makeCell("soft-reduct", Cell.Kind.Data, 5, 4),
    ],
    [RowGroup.of(0, 2, getById("thead")), RowGroup.of(2, 3, getById("tbody"))]
  );
}

// table with a tfoot in the middle
export namespace apple {
  export const element = Element.fromElement(
    <table>
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
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = Table.of(
    element,
    4,
    5,
    [
      makeCell("empty", Cell.Kind.Header, 0, 0),
      makeCell("2008", Cell.Kind.Header, 1, 0),
      makeCell("2007", Cell.Kind.Header, 2, 0),
      makeCell("2006", Cell.Kind.Header, 3, 0),
      makeCell("net", Cell.Kind.Header, 0, 1),
      makeCell("net-2008", Cell.Kind.Data, 1, 1),
      makeCell("net-2007", Cell.Kind.Data, 2, 1),
      makeCell("net-2006", Cell.Kind.Data, 3, 1),
      makeCell("cost", Cell.Kind.Header, 0, 2),
      makeCell("cost-2008", Cell.Kind.Data, 1, 2),
      makeCell("cost-2007", Cell.Kind.Data, 2, 2),
      makeCell("cost-2006", Cell.Kind.Data, 3, 2),
      makeCell("margin", Cell.Kind.Header, 0, 3),
      makeCell("margin-2008", Cell.Kind.Data, 1, 3),
      makeCell("margin-2007", Cell.Kind.Data, 2, 3),
      makeCell("margin-2006", Cell.Kind.Data, 3, 3),
      makeCell("percent", Cell.Kind.Header, 0, 4),
      makeCell("percent-2008", Cell.Kind.Data, 1, 4),
      makeCell("percent-2007", Cell.Kind.Data, 2, 4),
      makeCell("percent-2006", Cell.Kind.Data, 3, 4),
    ],
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 1, getById("body-2")),
      RowGroup.of(4, 1, getById("tfoot")),
    ]
  );
}

// example with colgroup
export namespace expenses {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-head">
        {" "}
        <col />
      </colgroup>
      <colgroup id="group-body">
        {" "}
        <col /> <col /> <col />
      </colgroup>
      <thead id="thead">
        <tr>
          {" "}
          <th id="empty" /> <th id="2008">2008</th> <th id="2007">2007</th>{" "}
          <th id="2006">2006</th>
        </tr>
      </thead>
      <tbody id="body-1">
        <tr>
          {" "}
          <th id="rd" scope="rowgroup">
            {" "}
            Research and development
          </th>
          <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td>{" "}
          <td id="rd-2006">$ 712</td>
        </tr>
        <tr>
          {" "}
          <th id="rd-percent" scope="row">
            {" "}
            Percentage of net sales
          </th>
          <td id="rd-percent-2008">
            3.4%
          </td> <td id="rd-percent-2007">3.3%</td>{" "}
          <td id="rd-percent-2006">3.7%</td>
        </tr>
      </tbody>
      <tbody id="body-2">
        <tr>
          {" "}
          <th id="sales" scope="rowgroup">
            {" "}
            Selling, general, and administrative
          </th>
          <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td>{" "}
          <td id="sales-2006">$ 2,433</td>
        </tr>
        <tr>
          {" "}
          <th id="sales-percent" scope="row">
            {" "}
            Percentage of net sales
          </th>
          <td id="sales-percent-2008">11.6%</td>{" "}
          <td id="sales-percent-2007">12.3%</td>{" "}
          <td id="sales-percent-2006">12.6%</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = Table.of(
    element,
    4,
    5,
    [
      makeCell("empty", Cell.Kind.Header, 0, 0),
      makeCell("2008", Cell.Kind.Header, 1, 0),
      makeCell("2007", Cell.Kind.Header, 2, 0),
      makeCell("2006", Cell.Kind.Header, 3, 0),
      makeCell("rd", Cell.Kind.Header, 0, 1),
      makeCell("rd-2008", Cell.Kind.Data, 1, 1),
      makeCell("rd-2007", Cell.Kind.Data, 2, 1),
      makeCell("rd-2006", Cell.Kind.Data, 3, 1),
      makeCell("rd-percent", Cell.Kind.Header, 0, 2),
      makeCell("rd-percent-2008", Cell.Kind.Data, 1, 2),
      makeCell("rd-percent-2007", Cell.Kind.Data, 2, 2),
      makeCell("rd-percent-2006", Cell.Kind.Data, 3, 2),
      makeCell("sales", Cell.Kind.Header, 0, 3),
      makeCell("sales-2008", Cell.Kind.Data, 1, 3),
      makeCell("sales-2007", Cell.Kind.Data, 2, 3),
      makeCell("sales-2006", Cell.Kind.Data, 3, 3),
      makeCell("sales-percent", Cell.Kind.Header, 0, 4),
      makeCell("sales-percent-2008", Cell.Kind.Data, 1, 4),
      makeCell("sales-percent-2007", Cell.Kind.Data, 2, 4),
      makeCell("sales-percent-2006", Cell.Kind.Data, 3, 4),
    ],
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 2, getById("body-2")),
    ],
    [
      ColGroup.of(0, 1, getById("group-head")),
      ColGroup.of(1, 3, getById("group-body")),
    ]
  );

  export const headerStates = [
    Header.State.Column, Header.State.Column, Header.State.Column, Header.State.Column, // first row, auto => column
    Header.State.RowGroup, Header.State.Row, Header.State.RowGroup, Header.State.Row // explicitly set
  ]
}

// same with colgroup defined by spans
export namespace expensesNum {
  export const element = Element.fromElement(
    <table>
      <colgroup id="group-head" span={1}></colgroup>
      <colgroup id="group-body">
        {" "}
        <col span={2} /> <col />
      </colgroup>
      <thead id="thead">
        <tr>
          {" "}
          <th id="empty" /> <th id="2008">2008</th> <th id="2007">2007</th>{" "}
          <th id="2006">2006</th>
        </tr>
      </thead>
      <tbody id="body-1">
        <tr>
          {" "}
          <th id="rd" scope="rowgroup">
            {" "}
            Research and development
          </th>
          <td id="rd-2008">$ 1,109</td> <td id="rd-2007">$ 782</td>{" "}
          <td id="rd-2006">$ 712</td>
        </tr>
        <tr>
          {" "}
          <th id="rd-percent" scope="row">
            {" "}
            Percentage of net sales
          </th>
          <td id="rd-percent-2008">
            3.4%
          </td> <td id="rd-percent-2007">3.3%</td>{" "}
          <td id="rd-percent-2006">3.7%</td>
        </tr>
      </tbody>
      <colgroup id="ignored" span={4}></colgroup>
      <tbody id="body-2">
        <tr>
          {" "}
          <th id="sales" scope="rowgroup">
            {" "}
            Selling, general, and administrative
          </th>
          <td id="sales-2008">$ 3,761</td> <td id="sales-2007">$ 2,963</td>{" "}
          <td id="sales-2006">$ 2,433</td>
        </tr>
        <tr>
          {" "}
          <th id="sales-percent" scope="row">
            {" "}
            Percentage of net sales
          </th>
          <td id="sales-percent-2008">11.6%</td>{" "}
          <td id="sales-percent-2007">12.3%</td>{" "}
          <td id="sales-percent-2006">12.6%</td>
        </tr>
      </tbody>
    </table>
  );
  const getById = getDescendantById(element);
  const makeCell = makeCellFromGetter(getById);

  export const expected = Table.of(
    element,
    4,
    5,
    [
      makeCell("empty", Cell.Kind.Header, 0, 0),
      makeCell("2008", Cell.Kind.Header, 1, 0),
      makeCell("2007", Cell.Kind.Header, 2, 0),
      makeCell("2006", Cell.Kind.Header, 3, 0),
      makeCell("rd", Cell.Kind.Header, 0, 1),
      makeCell("rd-2008", Cell.Kind.Data, 1, 1),
      makeCell("rd-2007", Cell.Kind.Data, 2, 1),
      makeCell("rd-2006", Cell.Kind.Data, 3, 1),
      makeCell("rd-percent", Cell.Kind.Header, 0, 2),
      makeCell("rd-percent-2008", Cell.Kind.Data, 1, 2),
      makeCell("rd-percent-2007", Cell.Kind.Data, 2, 2),
      makeCell("rd-percent-2006", Cell.Kind.Data, 3, 2),
      makeCell("sales", Cell.Kind.Header, 0, 3),
      makeCell("sales-2008", Cell.Kind.Data, 1, 3),
      makeCell("sales-2007", Cell.Kind.Data, 2, 3),
      makeCell("sales-2006", Cell.Kind.Data, 3, 3),
      makeCell("sales-percent", Cell.Kind.Header, 0, 4),
      makeCell("sales-percent-2008", Cell.Kind.Data, 1, 4),
      makeCell("sales-percent-2007", Cell.Kind.Data, 2, 4),
      makeCell("sales-percent-2006", Cell.Kind.Data, 3, 4),
    ],
    [
      RowGroup.of(0, 1, getById("thead")),
      RowGroup.of(1, 2, getById("body-1")),
      RowGroup.of(3, 2, getById("body-2")),
    ],
    [
      ColGroup.of(0, 1, getById("group-head")),
      ColGroup.of(1, 3, getById("group-body")),
    ]
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
      <tr></tr>
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

export namespace headersState {
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
        <th id="c21" rowspan={2}>row because of 32</th>
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
  )

  export const headerStates = [
    Header.State.Column, Header.State.Row, undefined,
    Header.State.Column, Header.State.Column, Header.State.Column, Header.State.Column,
    Header.State.Column, Header.State.Row, Header.State.Column, Header.State.Column
  ].map(Option.from)
}

export namespace headers {
  export const element = Element.fromElement(
    <table>
      <tr>
        <th id="text-content">not empty</th>
        <th id="child"><span id="not-empty"></span></th>
        <th id="empty"></th>
        <td id="data">Data cell can actually be header</td>
      </tr>
      <tr>
        <td id="foo" headers="text-content child empty data">Foo</td>
      </tr>
    </table>
  )
  const getById = getDescendantById(element);

  export const expected = [getById("text-content"), getById("data"), getById("child")];
}
