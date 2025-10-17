import { Array } from "@siteimprove/alfa-array";

import { getPackages, type Package } from "@manypkg/get-packages";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  coveragePath,
  type CoverageSummary,
  destinationPath,
  toCoverageData,
  toHtml,
} from "./transform-unit-test-coverage-data.js";

const targetPath = process.argv[2] ?? ".";

await generateUnitTestCoverageReport(targetPath);

/**
 * Find the coverage reports of all packages under `cwd` and generate an
 * HTML summary of line coverage by unit tests in each package.
 *
 * @public
 */
export async function generateUnitTestCoverageReport(cwd: string) {
  const packages = (await getPackages(cwd)).packages;

  const coverages = Array.collect(
    await Promise.all(packages.map(loadPackageCoverage)),
    toCoverageData,
  );

  const coverageReport = toHtml(coverages);

  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(destinationPath, "unit-test-coverage.html"),
    coverageReport,
  );

  console.log(
    `Wrote unit test coverage report for ${coverages.length} packages to ${path.join(destinationPath, "unit-test-coverage.html")}`,
  );
}

/**
 * Read the coverage summary of an individual package.
 */
async function loadPackageCoverage(
  pkg: Package,
): Promise<[Package, CoverageSummary]> {
  const summary = (await import(
    path.join(pkg.dir, coveragePath, "coverage-summary.json"),
    {
      with: { type: "json" },
    }
  )) as { default: CoverageSummary };

  return [pkg, summary.default] as const;
}
