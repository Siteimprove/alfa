import { read as readConfig } from "@changesets/config";
import { getCommitsThatAddFiles } from "@changesets/git";
import getChangeSets from "@changesets/read";
import type { Config, NewChangesetWithCommit } from "@changesets/types";
import { getPackages, type Packages } from "@manypkg/get-packages";

import * as path from "path";

import { Changelog } from "./build-changelog";
import resolveFrom = require("resolve-from");

const targetPath = process.argv[2] ?? ".";

export interface ChangelogFunctions {
  getBody(
    cwd: string,
    changesets: Array<NewChangesetWithCommit>,
    packages: Packages,
    config: Config
  ): Promise<string>;
}

main(targetPath);

async function main(cwd: string) {
  // Read packages list, and changeset config file
  const packages = await getPackages(cwd);
  const config = await readConfig(cwd, packages);

  // Check that a global changelog generator is provided
  // (changeset.changelog[1].global exists).
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

  // Load the global changelog provider.
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

  // Load changesets, add the commit hash to them
  const changesets = await getChangeSets(cwd);

  const commits = await getCommitsThatAddFiles(
    changesets.map((changeset) => `.changeset/${changeset.id}.md`),
    { cwd, short: true }
  );

  const changesetsWithCommit: Array<NewChangesetWithCommit> = changesets.map(
    (changeset, idx) => ({
      ...changeset,
      commit: commits[idx],
    })
  );

  // Build the new body for the global changelog.
  const body = await ChangelogFuncs.getBody(
    targetPath,
    changesetsWithCommit,
    packages,
    config
  );

  console.log(body);
}
