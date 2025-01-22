import type { PackageJSON } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";

import { String } from "@siteimprove/alfa-string";
import * as fs from "node:fs";
import * as path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

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
  return String.fallback(fallback)(await rl.question(`${msg} [${fallback}]:`));
}

const packageName = await questionWithFallback("Package name", "alfa-foo");
const dirName = await questionWithFallback(
  `Directory name (relative to ${rootDir})`,
  `packages/${packageName}`,
);
const description = await questionWithFallback("Description", "A package.");

rl.close();

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
console.log("Creating empty files...");
fs.writeFileSync(path.join(packageDir, "src", "index.ts"), "");
fs.writeFileSync(path.join(packageDir, "CHANGELOG.md"), "");

/*
 * Copying static templates
 */
console.log("Copying static templates...");
fs.writeFileSync(
  path.join(packageDir, "config", "api-extractor.json"),
  JSON.stringify(Templates.apiExtractor, null, 2),
);
fs.writeFileSync(path.join(packageDir, "README.md"), Templates.readme);
fs.writeFileSync(
  path.join(packageDir, "tsconfig.json"),
  JSON.stringify(Templates.TSConfig.workspace, null, 2),
);
fs.writeFileSync(
  path.join(packageDir, "src", "tsconfig.json"),
  JSON.stringify(Templates.TSConfig.src, null, 2),
);
fs.writeFileSync(
  path.join(packageDir, "test", "tsconfig.json"),
  JSON.stringify(Templates.TSConfig.test, null, 2),
);

/*
 * Creating package.json
 */
console.log("Creating package.json...");
fs.writeFileSync(
  path.join(packageDir, "package.json"),
  JSON.stringify(Templates.packageJSON, null, 2),
);
