import assembleReleasePlan from "@changesets/assemble-release-plan";
import { read as readConfig } from "@changesets/config";
import getChangeSets from "@changesets/read";
import { NewChangesetWithCommit } from "@changesets/types";
import { getPackages } from "@manypkg/get-packages";
import { Ok, Result } from "@siteimprove/alfa-result";

import { Changelog } from "./build-changelog";
import { Changeset } from "./get-changeset-details";

const targetPath = process.argv[2] ?? ".";

main();

async function main() {
  const packages = await getPackages(targetPath);
  // console.dir(packages);

  const config = await readConfig(targetPath, packages);
  console.dir(config);

  const changesets = await getChangeSets(targetPath);

  const releasePlan = assembleReleasePlan(
    changesets,
    packages,
    config,
    undefined,
    undefined
  );

  // console.dir(releasePlan);

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
      details.map(async (detail, idx) => [
        detail,
        await getPRLink(changesets[idx]),
      ])
    )
  );

  console.log(body);
}

async function getPRLink(changeset: NewChangesetWithCommit): Promise<string> {
  return `NOT A LINK ${changeset.commit}`;
}
