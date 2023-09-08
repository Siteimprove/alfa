import { getPackages } from "@manypkg/get-packages";
import * as fs from "fs";
import * as path from "path";
import { hasExtractorConfig } from "./has-extractor-config";

import { validateChangesets } from "./validate-changesets";
import { validatePackageJson } from "./validate-package-json";
import { validateWorkspaceTsconfig } from "./validate-workspace-tsconfig";

const targetPath = process.argv[2] ?? ".";

validate(targetPath);

/**
 * @public
 */
export async function validate(cwd: string) {
  const errors: Array<string> = [];

  const config = JSON.parse(
    fs.readFileSync(
      path.join(cwd, "config", "validate-structure.json"),
      "utf-8"
    )
  );

  const packages = await getPackages(cwd);

  if (config["validate-changesets"] ?? false) {
    errors.push(...(await validateChangesets(cwd)));
  }

  if (config["has-api-extractor-config"] ?? false) {
    for (const pkg of packages.packages) {
      errors.push(...hasExtractorConfig(pkg.packageJson.name, pkg.dir));
    }
  }

  if (typeof config["validate-package-json"] === "object") {
    for (const pkg of packages.packages) {
      errors.push(...validatePackageJson(pkg, config["validate-package-json"]));
    }
  }

  if (config["validate-workspace-tsconfig"]) {
    for (const pkg of packages.packages) {
      errors.push(...validateWorkspaceTsconfig(pkg));
    }
  }

  for (const error of errors) {
    console.error(error);
  }

  process.exit(errors.length);
}
