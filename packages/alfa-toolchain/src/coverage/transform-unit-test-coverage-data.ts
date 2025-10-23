import { Array } from "@siteimprove/alfa-array";
import { Option } from "@siteimprove/alfa-option";

import type { Package } from "@manypkg/get-packages";
import * as path from "node:path";

type Totals = {
  total: number;
  covered: number;
  skipped: number;
  // "Unknown" happens for packages skipped in tests.
  pct: number | "Unknown";
};
type Coverage = {
  lines: Totals;
  functions: Totals;
  statements: Totals;
  branches: Totals;
};
/**
 * @internal
 */
export type CoverageSummary = { total: Coverage; [file: string]: Coverage };

type CoverageData = {
  name: string;
  relativePath: string;
  lineCoverage: number;
};

/**
 * Path of the coverage report inside each package.
 *
 * @internal
 */
export const coveragePath = path.join("docs", "coverage");
/**
 * Path to store the global file once generated.
 *
 * @internal
 */
export const destinationPath = path.join("docs", "coverage");

/**
 * Turn (optional) coverage summary into coverage data.
 *
 * @internal
 */
export function toCoverageData([pkg, summary]: [
  pkg: Package,
  summary?: CoverageSummary,
]): Option<CoverageData> {
  // We still use nullish coalescing in case something went wrong and
  // the type assertion when reading the file was incorrect.
  const coverage = summary?.total?.lines?.pct;
  return Option.from(typeof coverage === "number" ? coverage : undefined).map(
    (cov) => ({
      name: pkg.packageJson.name,
      relativePath: pkg.relativeDir,
      lineCoverage: cov,
    }),
  );
}

/**
 * Turns a package name and relative path to a link to its coverage report.
 *
 * @remarks
 * The relative path is from where this script is invoked, normally the top-level
 * of the repository. Things are likely to break if this script is invoked from
 * another location.
 *
 * @internal
 * @knipignore used in tests
 */
export function toLink(name: string, relativePath: string) {
  // We need to go up the destination path, and then down the relative path before
  // finally finding the report.
  const upPath = destinationPath
    .split(path.sep)
    .map(() => "..")
    .join("/");

  // Note that the paths may have been built with any separator, but URLs always
  // use forward slashes, so we need to rewrite paths.
  const toUrlPath = (p: string) => p.split(path.sep).join("/");

  return `<a href="${upPath}/${toUrlPath(relativePath)}/${toUrlPath(coveragePath)}/index.html" target="_blank" rel="noopener noreferrer">${name}</a>`;
}

/**
 * Turns a coverage data into an HTML table row.
 *
 * @remarks
 * This adds classnames according to watermarks.
 *
 * @internal
 * @knipignore used in tests
 */
export function toTableRow({ name, relativePath, lineCoverage }: CoverageData) {
  const getClass = (coverage: number) =>
    coverage >= 85
      ? "high"
      : // We are more lax here than in the global vitest watermarks in order to
        // focus attention where it is really needed.
        coverage >= 60
        ? "medium"
        : "low";

  return `    <tr class="${getClass(lineCoverage)}">
      <td>${toLink(name, relativePath)}</td>
      <td style="text-align: right;">${lineCoverage
        .toFixed(2)
        .padStart(5, " ")}%</td>
    </tr>`;
}

/**
 * Turns an array of coverage data into an HTML table.
 *
 * @internal
 * @knipignore used in tests
 */
export function toHtmlTable(data: Array<CoverageData>): string {
  const header = `<table>
  <thead>
    <tr>
      <th>Package</th>
      <th>Unit Test Coverage (lines)</th>
    </tr>
  </thead>
  <tbody>
`;
  const rows = data.map(toTableRow).join("\n");
  const footer = `
  </tbody>
</table>`;
  return header + rows + footer;
}

/**
 * Turns an array of coverage data into a full HTML document.
 *
 * @internal
 */
export function toHtml(data: Array<CoverageData>): string {
  // The colors are stolen from Vitest `base.css`.
  // We could probably try and reuse more styling and scripting from vitest
  // reports, especially since we live in the same directory.

  const style = `<style>
    body {
      margin: 2rem;
    }
    .low { background: #FCE1E5 }
    .high { background: #E6F5D0 }
    .medium { background: #FFF4C2; }
    table {
      border-collapse: collapse;
      width: 100%;
      max-width: 600px;
      margin-top: 1rem;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
    }
    th {
      background-color: #f4f4f4;
      text-align: left;
    }
    .disclaimer {
      width: 50%;
      margin-left: auto;
      margin-right: auto;
      font-size: 1.2em;
      border: 2px black solid
      ;
    }
    .warning {
      font-weight: bold;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      font-size: larger;
    }
  </style>`;

  const head = `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alfa Packages Unit Test Coverage</title>
  ${style}
</head>`;

  const disclaimer = `<div class="disclaimer">
  <p class="warning">
    This is for internal documentation only,
    see <a href="./index.html">the global coverage report</a>.
  </p>
  <p>
    Some packages, <i>e.g.</i> <code>alfa-option</code>, are foundational
    and used a lot by other packages, <i>e.g.</i> <code>alfa-rules</code>.
    Thus, any test in <code>alfa-rules</code> will effectively also test
    parts of <code>alfa-option</code> (as integration test). This is
    reflected in <a href="./index.html">the global coverage report</a> who
    takes all tests into account, and this is sufficient to give a good
    measure of security to the codebase. However, foundational packages
    should also have specific unit tests, checking that the minutiae of
    each function works as intended. This report shows the coverage by
    unit tests inside each package. We should ultimately aim at getting
    these numbers as high as possible.
  </p>
</div>`;

  return `<!DOCTYPE html>
<!-- Autogenerated by packages/alfa-toolchain/src/coverage/gather-unit-test-coverage.ts, do not edit directly. -->
<html lang="en">
${head}
<body>
  ${disclaimer}
  <h1>Alfa Packages Unit Test Coverage</h1>
  ${toHtmlTable(data)}
</body>
</html>`;
}
