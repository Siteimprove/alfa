import { getPackages } from "@manypkg/get-packages";
import * as fs from "fs";
import * as path from "path";
import { hasExtractorConfig } from "./has-extractor-config";

import { validateChangesets } from "./validate-changesets";

const targetPath = process.argv[2] ?? ".";

enum Errors {
  INVALID_CHANGESETS = 1,
  MISSING_EXTRACTOR_CONFIG,
}

main(targetPath);

async function main(cwd: string) {
  const config = JSON.parse(
    fs.readFileSync(
      path.join(cwd, "config", "validate-structure.json"),
      "utf-8"
    )
  );

  const packages = await getPackages(cwd);

  console.dir(packages.packages[0]);

  if (config["validate-changesets"] ?? false) {
    await validateChangesets(cwd, Errors.INVALID_CHANGESETS);
  }

  if (config["has-api-extractor-config"] ?? false) {
    for (const pkg of packages.packages) {
      hasExtractorConfig(pkg.dir, Errors.MISSING_EXTRACTOR_CONFIG);
    }
  }
}
