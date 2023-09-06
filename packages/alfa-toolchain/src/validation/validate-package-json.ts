import { PackageJSON } from "@changesets/types";

/**
 * Extended PackageJSON type
 *
 * @remnarks
 * The one from @changesets/types does not include all possible properties…
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
 * `pkg` comes from @manypkg/get-packages, which sets `dir` to the correct OS
 * specific string.
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
  if (!name.startsWith("@siteimprove")) {
    errors.push(
      `${name}: package.json is not in the siteimprove organisation.`
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
    if (!dir.endsWith(packageJson?.repository?.directory ?? "INVALID")) {
      errors.push(
        `${name}: package.json repository.directory (${packageJson?.repository?.directory}) does not match its actual directory (${dir}).`
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
