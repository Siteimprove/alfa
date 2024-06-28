import { read as readConfig } from "@changesets/config";
import { getCommitsThatAddFiles } from "@changesets/git";
import getChangeSets from "@changesets/read";
import type { NewChangesetWithCommit } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";

import * as fs from "node:fs";
import * as path from "node:path";

import { type ChangelogFunctions, getConfigOption, Error } from "./helpers.js";

import resolveFrom = require("resolve-from");

const targetPath = process.argv[2] ?? ".";

main(targetPath);

/**
 * Update a global changelog
 *
 * @remarks
 * * The functions for generating it are imported from the file pointed at by
 *   changeset config.changelog[1].global
 * * Packages, config, and changesets list are read.
 * * Hashes of commits that created the changesets are added.
 * * CHANGELOG.md is read, from the current directory.
 * * New body is built via buildBody function.
 * * Full body is built, from old and new body, via insertBody function.
 * * CHANGELOG.md is overwritten with updated content.
 */
async function main(cwd: string) {
  // Read packages list, and changeset config file
  const packages = await getPackages(cwd);
  const config = await readConfig(cwd, packages);

  const global = getConfigOption(config, "global");

  // Load the global changelog provider.
  let ChangelogFuncs: ChangelogFunctions = {
    getBody: () => Promise.resolve(""),
    insertBody: () => "",
  };

  const changesetPath = path.join(cwd, ".changeset");
  const changelogPath = resolveFrom(changesetPath, global);

  let possibleChangelogFunc = require(changelogPath);
  if (possibleChangelogFunc.default) {
    possibleChangelogFunc = possibleChangelogFunc.default;
  }
  if (
    typeof possibleChangelogFunc.getBody === "function" &&
    typeof possibleChangelogFunc.insertBody === "function"
  ) {
    ChangelogFuncs = possibleChangelogFunc;
  } else {
    console.error("Could not resolve changelog generation functions");
    process.exit(Error.NO_GLOBAL_CHANGELOG_PROVIDER);
  }

  // Load the existing Changelog
  const changelogFile = path.join(targetPath, "CHANGELOG.md");
  const oldChangelog = fs.readFileSync(changelogFile, "utf-8");

  // Load changesets, add the commit hashes to them
  const changesets = await getChangeSets(cwd);

  const commits = await getCommitsThatAddFiles(
    changesets.map((changeset) => `.changeset/${changeset.id}.md`),
    { cwd, short: true },
  );

  const changesetsWithCommit: Array<NewChangesetWithCommit> = changesets.map(
    (changeset, idx) => ({
      ...changeset,
      commit: commits[idx],
    }),
  );

  // Build the new body for the global changelog and write it.
  const body = await ChangelogFuncs.getBody(
    changesetsWithCommit,
    packages,
    config,
  );

  const newChangelog = ChangelogFuncs.insertBody(oldChangelog, body);
  fs.writeFileSync(changelogFile, newChangelog, "utf-8");

  console.log(body);
}
