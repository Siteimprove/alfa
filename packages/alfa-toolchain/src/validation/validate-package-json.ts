import { PackageJSON } from "@changesets/types";
import * as path from "path";

/**
 * Extended PackageJSON type
 *
 * @remarks
 * The one from \@changesets/types does not include all possible properties…
 */
interface JSON extends PackageJSON {
  homepage?: string;
  repository?: {
    type?: string;
    url?: string;
    directory?: string;
  };
}

type Config = Partial<{
  organisation: string;
  homepage: string;
  repo: string;
  bugs: string;
  noExternalDeps: boolean;
  allowedExternalDeps: { [pkg: string]: Array<string> };
}>;

/**
 * Checks that a package.json file has the correct fields and structure.
 *
 * @remarks
 * `pkg` comes from \@manypkg/get-packages, which sets `dir` to the correct OS
 * specific string.
 *
 * @public
 */
export function validatePackageJson(
  {
    dir,
    packageJson,
  }: {
    dir: string;
    packageJson: JSON;
  },
  config: Config
): Array<string> {
  const errors: Array<string> = [];
  const name = packageJson.name;

  // name
  if (
    config.organisation !== undefined &&
    !name.startsWith(`${config.organisation}/`)
  ) {
    errors.push(
      `${name}: package.json is not in the ${config.organisation} organisation.`
    );
  }

  // homepage
  if (
    config.homepage !== undefined &&
    packageJson.homepage !== config.homepage
  ) {
    errors.push(
      `${name}: package.json has incorrect homepage: '${packageJson.homepage}'.`
    );
  }

  // repository
  if (config.repo !== undefined) {
    if (packageJson?.repository?.type !== "git") {
      errors.push(`${name}: package.json does not repository.type: "git".`);
    }
    if (packageJson?.repository?.url !== config.repo) {
      errors.push(
        `${name}: package.json does not have repository.url: "${config.repo}".`
      );
    }

    // dir is built by @manypkg/get-packages with OS specific separator,
    // but packageJson.repository.directory is stored with posix ones (/).
    // So, we need to do some magic to convert formats.
    const posixDir = dir.split(path.sep).join(path.posix.sep);
    if (!posixDir.endsWith(packageJson?.repository?.directory ?? "INVALID")) {
      errors.push(
        `${name}: package.json repository.directory (${packageJson?.repository?.directory}) does not match its actual directory (${posixDir}).`
      );
    }
  }

  // external dependencies
  if (config.noExternalDeps) {
    for (const dependency in packageJson.dependencies) {
      if (
        // internal dependencies are always allowed.
        !dependency.startsWith("@siteimprove") &&
        // types dependencies don't matter
        !dependency.startsWith("@types") &&
        // external dependencies must be explicitly allowed.
        !(config.allowedExternalDeps?.[name] ?? []).includes(dependency)
      ) {
        errors.push(`${name}: depends on non-allowed external ${dependency}`);
      }
    }
  }

  return errors;
}
