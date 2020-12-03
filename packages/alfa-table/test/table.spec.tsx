import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Table } from "../src/table";

test(`.from() constructs a table from a simple 2x2 <table> element with direct
      child <tr> elements`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>Foo</th>
        <th>Bar</th>
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
        element: "/table[1]/tr[1]/th[1]",
        type: "header",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        scope: "column",
        headers: [],
      },
      {
        element: "/table[1]/tr[1]/th[2]",
        type: "header",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        scope: "column",
        headers: [],
      },
      {
        element: "/table[1]/tr[2]/td[1]",
        type: "data",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        scope: null,
        headers: [{ x: 0, y: 0 }],
      },
      {
        element: "/table[1]/tr[2]/td[2]",
        type: "data",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        scope: null,
        headers: [{ x: 1, y: 0 }],
      },
    ],
  });
});

test(`.from() constructs a table from a simple 2x2 <table> element with child
      <thead> and <tbody> elements`, (t) => {
  const table = Table.from(
    <table>
      <thead>
        <tr>
          <th>Foo</th>
          <th>Bar</th>
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
        element: "/table[1]/thead[1]/tr[1]/th[1]",
        type: "header",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        scope: "column",
        headers: [],
      },
      {
        element: "/table[1]/thead[1]/tr[1]/th[2]",
        type: "header",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        scope: "column",
        headers: [],
      },
      {
        element: "/table[1]/tbody[1]/tr[1]/td[1]",
        type: "data",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        scope: null,
        headers: [{ x: 0, y: 0 }],
      },
      {
        element: "/table[1]/tbody[1]/tr[1]/td[2]",
        type: "data",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        scope: null,
        headers: [{ x: 1, y: 0 }],
      },
    ],
  });
});

test(`.from() correctly handles a <td> element with a rowspan=0 attribute`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <td>Foo</td>
        <td rowspan="0">42</td>
      </tr>
      <tr>
        <td>Bar</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        element: "/table[1]/tr[1]/td[1]",
        type: "data",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        scope: null,
        headers: [],
      },
      {
        element: "/table[1]/tr[1]/td[2]",
        type: "data",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 2,
        scope: null,
        headers: [],
      },
      {
        element: "/table[1]/tr[2]/td[1]",
        type: "data",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        scope: null,
        headers: [],
      },
    ],
  });
});
