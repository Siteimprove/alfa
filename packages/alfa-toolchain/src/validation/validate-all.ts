import { getPackages } from "@manypkg/get-packages";
import { hasExtractorConfig } from "./has-extractor-config";

import { validateChangesets } from "./validate-changesets";

const targetPath = process.argv[2] ?? ".";

enum Errors {
  INVALID_CHANGESETS = 1,
  MISSING_EXTRACTOR_CONFIG,
}

main(targetPath);

async function main(cwd: string) {
  const packages = await getPackages(cwd);

  console.dir(packages.packages[0]);

  await validateChangesets(cwd, Errors.INVALID_CHANGESETS);

  for (const pkg of packages.packages) {
    hasExtractorConfig(pkg.dir, Errors.MISSING_EXTRACTOR_CONFIG);
  }
}
