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
        scope: "column",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        element: "/table[1]/tr[1]/th[2]",
        scope: "column",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        element: "/table[1]/tr[2]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
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
        scope: "column",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        element: "/table[1]/thead[1]/tr[1]/th[2]",
        scope: "column",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        element: "/table[1]/tbody[1]/tr[1]/td[1]",
        anchor: { x: 0, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 0, y: 0 }],
      },
      {
        element: "/table[1]/tbody[1]/tr[1]/td[2]",
        anchor: { x: 1, y: 1 },
        width: 1,
        height: 1,
        headers: [{ x: 1, y: 0 }],
      },
    ],
    groups: [
      { y: 0, height: 1 },
      { y: 1, height: 1 },
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
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
        element: "/table[1]/tr[1]/td[2]",
        anchor: { x: 1, y: 0 },
        width: 1,
        height: 2,
        headers: [],
      },
      {
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

test(`.from() correctly assigns implicit row headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>Header</th>
        <td>Data</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        element: "/table[1]/tr[1]/th[1]",
        scope: "row",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
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

test(`.from() correctly assigns implicit column headers`, (t) => {
  const table = Table.from(
    <table>
      <tr>
        <th>Header</th>
      </tr>
      <tr>
        <td>Data</td>
      </tr>
    </table>
  );

  t.deepEqual(table.toJSON(), {
    element: "/table[1]",
    cells: [
      {
        element: "/table[1]/tr[1]/th[1]",
        scope: "column",
        anchor: { x: 0, y: 0 },
        width: 1,
        height: 1,
        headers: [],
      },
      {
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
