import { PackageJSON } from "@changesets/types";
import * as fs from "fs";
import * as path from "path";

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
  const errors: Array<string> = [];

  const internalDependencies: Array<string> = [];
  for (const depType of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ] as const) {
    for (const dependency in packageJson[depType]) {
      if (packageJson[depType]?.[dependency].startsWith("workspace")) {
        internalDependencies.push(
          // Keep everything between last / and end of line.
          dependency.replace(/.*\/(?<name>[a-z\-]*)$/, "$1"),
        );
      }
    }
  }

  const tsconfigSrc = JSON.parse(
    fs.readFileSync(path.join(dir, "src", "tsconfig.json"), "utf-8"),
  );
  const tsconfigTest = fs.existsSync(path.join(dir, "test", "tsconfig.json"))
    ? JSON.parse(
        fs.readFileSync(path.join(dir, "test", "tsconfig.json"), "utf-8"),
      )
    : undefined;
  const references = (tsconfigSrc?.references ?? [])
    .concat(tsconfigTest?.references ?? [])
    // Keep everything between last / and end of line.
    .map((ref: any) => ref?.path.replace(/.*\/(?<name>[a-z\-]*)$/, "$1") ?? "")
    // "src" is referenced from the test/tsconfig.json but does not need to be
    // a listed dependency.
    .filter((ref: any) => ref !== "" && ref !== "src") as Array<string>;

  for (const dependency of internalDependencies) {
    if (!references.includes(dependency)) {
      errors.push(
        `${name}: dependency ${dependency} is not referenced from tsconfig.json`,
      );
    }
  }

  for (const reference of references) {
    if (!internalDependencies.includes(reference)) {
      errors.push(
        `${name}: reference ${reference} from tsconfig.json is not a dependency.`,
      );
    }
  }

  return errors;
}
