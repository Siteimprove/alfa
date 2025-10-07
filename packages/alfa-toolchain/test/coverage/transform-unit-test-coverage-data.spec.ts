import { test } from "@siteimprove/alfa-test";

import {
  toLink,
  toTableRow,
} from "../../dist/coverage/generate-unit-test-coverage.js";

test("toLink() returns correct anchor for package coverage", (t) => {
  const name = "pkg-name";
  const relativePath = "packages/pkg";

  const actual = toLink(name, relativePath);
  const expected = `<a href="../../packages/pkg/docs/coverage/index.html" target="_blank" rel="noopener noreferrer">pkg-name</a>`;

  t.equal(actual, expected);
});

test("toTableRow() returns correct table row for 0% coverage (low)", (t) => {
  const data = {
    name: "pkg-name",
    relativePath: "packages/pkg",
    lineCoverage: 0,
  };

  const actual = toTableRow(data);

  const expected = `    <tr class="low">
      <td><a href="../../packages/pkg/docs/coverage/index.html" target="_blank" rel="noopener noreferrer">pkg-name</a></td>
      <td style="text-align: right;"> 0.00%</td>
    </tr>`;

  t.equal(actual, expected);
});

test("toTableRow() returns correct table row for 80% coverage (medium)", (t) => {
  const data = {
    name: "pkg-name",
    relativePath: "packages/pkg",
    lineCoverage: 80,
  };

  const actual = toTableRow(data);

  const expected = `    <tr class="medium">
      <td><a href="../../packages/pkg/docs/coverage/index.html" target="_blank" rel="noopener noreferrer">pkg-name</a></td>
      <td style="text-align: right;">80.00%</td>
    </tr>`;

  t.equal(actual, expected);
});

test("toTableRow() returns correct table row for 100% coverage (high)", (t) => {
  const data = {
    name: "pkg-name",
    relativePath: "packages/pkg",
    lineCoverage: 100,
  };

  const actual = toTableRow(data);

  const expected = `    <tr class="high">
      <td><a href="../../packages/pkg/docs/coverage/index.html" target="_blank" rel="noopener noreferrer">pkg-name</a></td>
      <td style="text-align: right;">100.00%</td>
    </tr>`;

  t.equal(actual, expected);
});
