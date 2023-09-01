import { read as readConfig } from "@changesets/config";
import getChangeSets from "@changesets/read";
import type { Config, NewChangeset } from "@changesets/types";
import { getPackages, type Packages } from "@manypkg/get-packages";

import * as path from "path";

import { Changelog } from "./build-changelog";
import resolveFrom = require("resolve-from");

const targetPath = process.argv[2] ?? ".";

export interface ChangelogFunctions {
  getBody(
    cwd: string,
    changesets: Array<NewChangeset>,
    packages: Packages,
    config: Config
  ): Promise<string>;
}

main(targetPath);

async function main(cwd: string) {
  const packages = await getPackages(cwd);
  // console.dir(packages);

  const config = await readConfig(cwd, packages);
  // console.dir(config);

  const changelog = config.changelog;
  if (changelog === false) {
    console.error(
      "Changeset config.changelog is not in the correct format (missing options)"
    );
    process.exit(1);
  }
  const global = changelog[1]?.global;

  if (typeof global !== "string") {
    console.error(
      "Changeset config.changelog is not in the correct format (missing global)"
    );
    process.exit(1);
  }

  const changesets = await getChangeSets(cwd);

  let ChangelogFuncs: ChangelogFunctions = {
    getBody: () => Promise.resolve(""),
  };

  const changesetPath = path.join(cwd, ".changeset");
  let changelogPath = resolveFrom(changesetPath, global);

  let possibleChangelogFunc = require(changelogPath);
  if (possibleChangelogFunc.default) {
    possibleChangelogFunc = possibleChangelogFunc.default;
  }
  if (typeof possibleChangelogFunc.getBody === "function") {
    ChangelogFuncs = possibleChangelogFunc;
  } else {
    console.error("Could not resolve changelog generation functions");
    process.exit(2);
  }

  const body = await ChangelogFuncs.getBody(
    targetPath,
    changesets,
    packages,
    config
  );

  console.log(body);
}
