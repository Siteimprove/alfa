import type { PackageJSON } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";
import { simpleGit } from "simple-git";
import chalk from "chalk";
import stringify from "json-stringify-pretty-compact";

import { String } from "@siteimprove/alfa-string";
import * as fs from "node:fs";
import * as path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const git = simpleGit();

/*
 * Gathering info about workspaces structure.
 */
const packages = await getPackages(".");
const rootDir = packages.root.dir;
// We'll copy stuff from the first packageJSON file we find, since these should
// be kept identical anyway.
const samplePackageJSON = packages.packages[0].packageJson as PackageJSON & {
  homepage?: string;
  repository?: { url?: string };
  bugs?: string;
};
// First package with a dependency to alfa-test gives us the correct version.
const alfaTestVersion = packages.packages
  .map((pkg) => pkg?.packageJson?.devDependencies?.["@siteimprove/alfa-test"])
  .find((version) => version !== undefined);

/*
 * Asking questions about package.
 */
const rl = createInterface({ input, output });

async function questionWithFallback(
  msg: string,
  fallback: string,
): Promise<string> {
  return String.fallback(fallback)(
    await rl.question(`${msg} [${chalk.dim(fallback)}]:`),
  );
}

const packageName = await questionWithFallback("Package name", "alfa-foo");
const dirName = await questionWithFallback(
  `Directory name (relative to ${rootDir})`,
  `packages/${packageName}`,
);
const description = await questionWithFallback("Description", "A package.");

rl.close();
console.log("\n");

const packageDir = path.join(rootDir, dirName);

/*
 * Building templates for files.
 */
namespace Templates {
  export const apiExtractor = {
    $schema:
      "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
    extends: "../../../config/api-extractor.json",
    mainEntryPointFilePath: "<projectFolder>/dist/index.d.ts",
  };

  export const readme = `# ${packageName.replace("alfa-", "Alfa ").replace(/-/g, " ")}

${description}
`;

  export namespace TSConfig {
    export const workspace = {
      $schema: "http://json.schemastore.org/tsconfig",
      extends: "../tsconfig.json",
      files: [],
      references: [{ path: "./src" }, { path: "./test" }],
    };

    export const src = {
      $schema: "http://json.schemastore.org/tsconfig",
      extends: "../tsconfig.json",
      compilerOptions: { outDir: "../dist" },
      include: ["./index.ts"],
    };

    export const test = {
      $schema: "http://json.schemastore.org/tsconfig",
      extends: "../tsconfig.json",
      compilerOptions: {
        noEmit: true,
      },
      files: [],
      references: [{ path: "../src" }],
    };

    // If Alfa test is a sibling workspace, link to it.
    if (fs.existsSync(path.join(packageDir, "..", "alfa-test"))) {
      test.references.push({ path: "../../alfa-test" });
    }
  }

  export const packageJSON = {
    $schema: "http://json.schemastore.org/package",
    name: `@siteimprove/${packageName}`,
    homepage: samplePackageJSON.homepage ?? "https://alfa.siteimprove.com",
    version: samplePackageJSON.version,
    license: "MIT",
    description,
    repository: {
      type: "git",
      url: samplePackageJSON?.repository?.url,
      directory: dirName,
    },
    bugs:
      samplePackageJSON.bugs ?? "https://github.com/siteimprove/alfa/issues",
    engines: { node: ">=20.0.0" },
    type: "module",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    files: ["dist/**/*.js", "dist/**/*.d.ts"],
    devDependencies: { "@siteimprove/alfa-test": alfaTestVersion },
    publishConfig: {
      access: "public",
      registry: "https://npm.pkg.github.com/",
    },
  };
}

/*
 * Creating package directory structure.
 */
console.log(`Creating directory structure in ${packageDir}...`);

fs.mkdirSync(packageDir, { recursive: true });
for (const subDir of ["config", "dist", "src", "test"]) {
  fs.mkdirSync(path.join(packageDir, subDir));
}

/*
 * Creating empty files.
 */
console.log(chalk.dim("Creating empty files..."));
fs.writeFileSync(path.join(packageDir, "src", "index.ts"), "");
fs.writeFileSync(path.join(packageDir, "CHANGELOG.md"), "");

/*
 * Copying static templates
 */
console.log(chalk.dim("Copying static templates..."));
fs.writeFileSync(
  path.join(packageDir, "config", "api-extractor.json"),
  stringify(Templates.apiExtractor),
);
fs.writeFileSync(path.join(packageDir, "README.md"), Templates.readme);
fs.writeFileSync(
  path.join(packageDir, "tsconfig.json"),
  stringify(Templates.TSConfig.workspace),
);
fs.writeFileSync(
  path.join(packageDir, "src", "tsconfig.json"),
  stringify(Templates.TSConfig.src),
);
fs.writeFileSync(
  path.join(packageDir, "test", "tsconfig.json"),
  stringify(Templates.TSConfig.test),
);

/*
 * Updating intermediate tsconfig.json
 */
console.log(chalk.dim("Updating intermediate tsconfig.json..."));
// We could use ts.readConfigFile but it somehow seems to be typed as returning
// `any`, so it brings little value.
const intermediateTSConfig = JSON.parse(
  fs.readFileSync(path.join(packageDir, "..", "tsconfig.json"), "utf-8"),
);
intermediateTSConfig.references.push({ path: packageName });
(intermediateTSConfig.references as Array<{ path: string }>).sort((a, b) =>
  a.path.localeCompare(b.path),
);
fs.writeFileSync(
  path.join(packageDir, "..", "tsconfig.json"),
  stringify(intermediateTSConfig),
);

/*
 * Creating package.json
 */
console.log(chalk.dim("Creating package.json..."));
fs.writeFileSync(
  path.join(packageDir, "package.json"),
  stringify(Templates.packageJSON),
);

/*
 * Adding files to git
 */
console.log(chalk.dim("Staging files..."));
git.add([
  path.join(packageDir, "src", "index.ts"),
  path.join(packageDir, "CHANGELOG.md"),
  path.join(packageDir, "config", "api-extractor.json"),
  path.join(packageDir, "README.md"),
  path.join(packageDir, "tsconfig.json"),
  path.join(packageDir, "src", "tsconfig.json"),
  path.join(packageDir, "test", "tsconfig.json"),
  path.join(packageDir, "package.json"),
]);

/*
 * Closing
 */
console.log("\nDone!");
console.warn(chalk.bold("Check created files and commit changes."));
