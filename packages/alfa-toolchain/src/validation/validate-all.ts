/*
 The "." default directory is relative to this file for dynamic imports, not
 to the shell invocation directory. So it is always safer to pass the actual
 directory as CLI option, typically using "$(pwd)" to let the shell handle it
 */
import { getPackages } from "@manypkg/get-packages";
import * as path from "node:path";
import { loadJSON } from "../common.js";

import { hasExtractorConfig } from "./has-extractor-config.js";
import { isInClusters } from "./is-in-clusters.js";
import { validateChangesets } from "./validate-changesets.js";
import { validatePackageJson } from "./validate-package-json.js";
import { validateWorkspaceTsconfig } from "./validate-workspace-tsconfig.js";

const targetPath = process.argv[2] ?? ".";

await validate(targetPath);

/**
 * @public
 */
export async function validate(rootDir: string) {
  const errors: Array<string> = [];

  const config = await loadJSON(
    path.join(rootDir, "config", "validate-structure.json"),
  );

  const packages = await getPackages(rootDir);

  if (config["validate-changesets"] ?? false) {
    errors.push(
      ...(await validateChangesets(rootDir, config["forbid-major"] ?? false)),
    );
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

  if (config["is-in-clusters"] ?? false) {
    let clustersDefinitionPath = path.join(
      rootDir,
      "config",
      "package-clusters.json",
    );

    const { clusters } = await loadJSON(clustersDefinitionPath);

    errors.push(
      ...isInClusters(
        packages.packages.map((pkg) => pkg.packageJson.name),
        clusters,
        clustersDefinitionPath,
      ),
    );
  }

  for (const error of errors) {
    console.error(error);
  }

  process.exit(errors.length);
}
