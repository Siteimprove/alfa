import getChangeSets from "@changesets/read";
import { NewChangeset } from "@changesets/types";
import { Ok, Result } from "@siteimprove/alfa-result";

import { Changelog } from "./build-changelog";
import { Changeset } from "./get-changeset-details";

const targetPath = process.argv[2] ?? ".";

main();

async function main() {
  const changesets = await getChangeSets(targetPath);

  // console.dir(changesets, { depth: null });

  const details = changesets
    .map(Changeset.getDetails)
    .filter<Ok<Changeset.Details>>(Result.isOk)
    .map((changeset) => changeset.get());

  const body = Changelog.buildBody(
    details.map((detail) => [detail, "NOT A LINK"])
  );

  console.log(body);
}

async function getPRLink(changeset: NewChangeset): Promise<string> {
  return "NOT A LINK";
}
