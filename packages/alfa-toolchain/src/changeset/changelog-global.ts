import { read as readConfig } from "@changesets/config";
import { getCommitsThatAddFiles } from "@changesets/git";
import getChangeSets from "@changesets/read";
import type { NewChangesetWithCommit } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";

import * as path from "path";
import { type ChangelogFunctions, getConfigOption, Error } from "./helpers";

import resolveFrom = require("resolve-from");

const targetPath = process.argv[2] ?? ".";

main(targetPath);

async function main(cwd: string) {
  // Read packages list, and changeset config file
  const packages = await getPackages(cwd);
  const config = await readConfig(cwd, packages);

  const global = getConfigOption(config, "global");

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
    process.exit(Error.NO_GLOBAL_CHANGELOG_PROVIDER);
  }

  // Load changesets, add the commit hashes to them
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
    changesetsWithCommit,
    packages,
    config
  );

  console.log(body);
}
