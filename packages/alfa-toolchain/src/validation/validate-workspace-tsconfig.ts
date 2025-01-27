import type { PackageJSON } from "@changesets/types";

import { Array } from "@siteimprove/alfa-array";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * @public
 */
export function validateWorkspaceTsconfig({
  dir,
  packageJson,
}: {
  dir: string;
  packageJson: PackageJSON;
}): Array<string> {
  const name = packageJson.name;
  let errors: Array<string> = [];

  const internalDependencies = Array.from(
    getInternalDependencies(
      packageJson,
      "dependencies",
      "peerDependencies",
      "optionalDependencies",
    ),
  );
  const srcReferences = getTSConfigReferences(dir, "src");

  const internalDevDependencies = Array.from(
    getInternalDependencies(packageJson, "devDependencies"),
  );
  const testReferences = getTSConfigReferences(dir, "test");

  errors = Array.concat(
    errors,
    Array.subtract(internalDependencies, srcReferences).map(
      missingDependency(name, "dependency", "src"),
    ),
    Array.subtract(srcReferences, internalDependencies).map(
      missingReference(name, "dependency", "src"),
    ),
    Array.subtract(internalDevDependencies, testReferences).map(
      missingDependency(name, "devDependency", "test"),
    ),
    Array.subtract(testReferences, internalDevDependencies).map(
      missingReference(name, "devDependency", "test"),
    ),
  );

  return errors;
}

type Kind =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies";

/**
 * Get all dependencies to a `workspace` protocol, from the given kinds of
 * dependencies
 */
function* getInternalDependencies(
  packageJson: PackageJSON,
  ...kinds: Array<Kind>
): Iterable<string> {
  for (const depType of kinds) {
    for (const dependency in packageJson[depType]) {
      if (packageJson[depType]?.[dependency].startsWith("workspace")) {
        // Keep everything between last / and end of line.
        yield dependency.replace(/.*\/(?<name>[a-z\-]*)$/, "$1");
      }
    }
  }
}

function getTSConfigReferences(
  dir: string,
  which: "src" | "test",
): Array<string> {
  const tsconfigPath = path.join(dir, which, "tsconfig.json");
  const tsconfigFile = fs.existsSync(tsconfigPath)
    ? JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"))
    : undefined;

  return (
    (tsconfigFile?.references ?? [])
      // Keep everything between last / and end of line.
      .map(
        (ref: any) => ref?.path.replace(/.*\/(?<name>[a-z\-]*)$/, "$1") ?? "",
      )
      // "src" is referenced from the test/tsconfig.json but does not need to be
      // a listed dependency.
      .filter((ref: any) => ref !== "" && ref !== "src") as Array<string>
  );
}

function missingDependency(
  pkg: string,
  kind: string,
  which: string,
): (dependency: string) => string {
  return (dependency) =>
    `${pkg}: ${kind} ${dependency} is not listed as a reference in ${which} TS config.`;
}

function missingReference(
  pkg: string,
  kind: string,
  which: string,
): (reference: string) => string {
  return (reference) =>
    `${pkg}: reference ${reference} from ${which} tsconfig.json is not a ${kind}.`;
}
