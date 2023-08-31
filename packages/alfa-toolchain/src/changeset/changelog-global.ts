import assembleReleasePlan from "@changesets/assemble-release-plan";
import { read as readConfig } from "@changesets/config";
import { getInfo } from "@changesets/get-github-info";
import { getCommitsThatAddFiles } from "@changesets/git";
import getChangeSets from "@changesets/read";
import { NewChangeset } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";
import { Ok, Result } from "@siteimprove/alfa-result";
import * as path from "path";

import { Changelog } from "./build-changelog";
import { Changeset } from "./get-changeset-details";

const targetPath = process.argv[2] ?? ".";

main();

async function main() {
  const packages = await getPackages(targetPath);
  // console.dir(packages);

  const config = await readConfig(targetPath, packages);
  // console.dir(config);

  const changesets = await getChangeSets(targetPath);

  const releasePlan = assembleReleasePlan(
    changesets,
    packages,
    config,
    undefined,
    undefined
  );

  // console.dir(releasePlan);

  const { oldVersion, newVersion } = releasePlan.releases[0];

  console.log(`Going from ${oldVersion} to ${newVersion}`);

  const commits = await getCommitsThatAddFiles(
    changesets.map((changeset) => `.changeset/${changeset.id}.md`),
    { cwd: targetPath, short: true }
  );

  // @ts-ignore
  const repo = config.changelog[1].repo;

  const prLinks = (
    (await Promise.all(
      commits.map(async (commit) =>
        commit === undefined ? undefined : await getInfo({ commit, repo })
      )
    )) ?? []
  ).map((info) => info?.links.pull ?? undefined);

  const details = changesets
    .map(Changeset.getDetails)
    .filter<Ok<Changeset.Details>>(Result.isOk)
    .map((changeset) => changeset.get());

  if (details.length !== changesets.length) {
    console.error("Some changesets are invalid");
    process.exit(1);
  }

  const body = Changelog.buildBody(
    await Promise.all(
      details.map(async (detail, idx) => [detail, prLinks[idx]])
    )
  );

  console.log(body);
}
