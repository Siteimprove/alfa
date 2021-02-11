import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Table } from "../src/table";

test(`.from() constructs a table from a simple 2x2 <table> element with direct
      child <tr> elements`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>A</th>
        <th>B</th>
      </tr>
      <tr>
        <td>1</td>
        <td>2</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[1]/th[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[2]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 1, y: 0 }],
      },
    ],
    groups: [],
  });
});

test(`.from() constructs a table from a simple 2x2 <table> element with child
      <thead> and <tbody> elements`, (t) => {
  const table = Table.from(
    <table>
      <thead>
        <tr>
          <th>A</th>
          <th>B</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>2</td>
        </tr>
      </tbody>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "column",
        element: "/table[1]/thead[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/thead[1]/tr[1]/th[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tbody[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "data",
        element: "/table[1]/tbody[1]/tr[1]/td[2]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 1, y: 0 }],
      },
    ],
    groups: [
      {
        element: "/table[1]/thead[1]",
        y: 0,
        height: 1,
      },
      {
        element: "/table[1]/tbody[1]",
        y: 1,
        height: 1,
      },
    ],
  });
});

test(`.from() handles a <td> element with a rowspan=0 attribute`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td>1</td>
        <td rowspan="0">2</td>
      </tr>
      <tr>
        <td>3</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[1]/td[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 2,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns implicit row headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>A</th>
        <td>1</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "row",
        element: "/table[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns explicit row headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td id="header">A</td>
        <td headers="header">1</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[1]/td[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns implicit column headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>A</th>
      </tr>
      <tr>
        <td>1</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns explicit column headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td id="header">A</td>
      </tr>
      <tr>
        <td headers="header">1</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns implicit row and column headers for the same
      table`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td></td>
        <th>A</th>
        <th>B</th>
      </tr>
      <tr>
        <th>C</th>
        <td>1</td>
        <td>2</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[1]/th[1]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[1]/th[2]",
        anchor: { x: 2, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "row",
        element: "/table[1]/tr[2]/th[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      {
        type: "data",
        element: "/table[1]/tr[2]/td[2]",
        anchor: { x: 2, y: 1 },
        width: 1,
        height: 1,
        headers: [
          { x: 2, y: 0 },
          { x: 0, y: 1 },
        ],
      },
    ],
    groups: [],
  });
});

test(`.from() assigns headers within a row group`, (t) => {
  const table = Table.from(
    <table>
      <tbody>
        <tr>
          <th rowspan="2" scope="rowgroup">
            A
          </th>
          <th>B</th>
          <td>1</td>
        </tr>
        <tr>
          <th>C</th>
          <td>2</td>
        </tr>
      </tbody>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "row-group",
        element: "/table[1]/tbody[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 2,
        headers: [],
      },
      {
        type: "header",
        scope: "row",
        element: "/table[1]/tbody[1]/tr[1]/th[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "data",
        element: "/table[1]/tbody[1]/tr[1]/td[1]",
        anchor: { x: 2, y: 0 },
        width: 1,
        height: 1,
        headers: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      {
        type: "header",
        scope: "row",
        element: "/table[1]/tbody[1]/tr[2]/th[1]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "data",
        element: "/table[1]/tbody[1]/tr[2]/td[1]",
        anchor: { x: 2, y: 1 },
        width: 1,
        height: 1,
        headers: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      },
    ],
    groups: [
      {
        element: "/table[1]/tbody[1]",
        y: 0,
        height: 2,
      },
    ],
  });
});

test(`.from() assigns headers within a column group`, (t) => {
  const table = Table.from(
    <table>
      <colgroup span="2"></colgroup>
      <tr>
        <th colspan="2" scope="colgroup">
          A
        </th>
      </tr>
      <tr>
        <th>B</th>
        <th>C</th>
      </tr>
      <tr>
        <td>1</td>
        <td>2</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "header",
        scope: "column-group",
        element: "/table[1]/tr[1]/th[1]",
        anchor: { x: 0, y: 0 },
        width: 2,
        height: 1,
        headers: [],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[2]/th[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "header",
        scope: "column",
        element: "/table[1]/tr[2]/th[2]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        type: "data",
        element: "/table[1]/tr[3]/td[1]",
        anchor: { x: 0, y: 2 },
        width: 1,
        height: 1,
        headers: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      {
        type: "data",
        element: "/table[1]/tr[3]/td[2]",
        anchor: { x: 1, y: 2 },
        width: 1,
        height: 1,
        headers: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
        ],
      },
    ],
    groups: [
      {
        element: "/table[1]/colgroup[1]",
        x: 0,
        width: 2,
      },
    ],
  });
});

test(`.from() gracefully handles invalid elements in tables`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td>1</td>
      </tr>
      <input />
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        type: "data",
        element: "/table[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
    ],
    groups: [],
  });
});
