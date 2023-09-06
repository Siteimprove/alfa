import { PackageJSON } from "@changesets/types";
import * as fs from "fs";
import * as path from "path";

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
          dependency.replace(/.*\/(?<name>[a-z\-]*)$/, "$1")
        );
      }
    }
  }

  const tsconfig = JSON.parse(
    fs.readFileSync(path.join(dir, "tsconfig.json"), "utf-8")
  );
  const references = (tsconfig?.references ?? [])
    // Keep everything between last / and end of line.
    .map((ref: any) => ref?.path.replace(/.*\/(?<name>[a-z\-]*)$/, "$1") ?? "")
    .filter((ref: any) => ref !== "") as Array<string>;

  for (const dependency of internalDependencies) {
    if (!references.includes(dependency)) {
      errors.push(
        `${name}: dependency ${dependency} is not referenced from tsconfig.json`
      );
    }
  }

  for (const reference of references) {
    if (!internalDependencies.includes(reference)) {
      errors.push(
        `${name}: reference ${reference} from tsconfig.json is not a dependency.`
      );
    }
  }

  return errors;
}
