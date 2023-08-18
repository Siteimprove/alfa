import getChangeSets from "@changesets/read";
import { Err, Result } from "@siteimprove/alfa-result";

import { getChangesetDetails } from "../changeset/get-changeset-details";

const targetPath = process.argv[2] ?? ".";

main();

async function main() {
  const changesets = await getChangeSets(targetPath);

  const invalid = changesets
    .map(getChangesetDetails)
    .filter<Err<string>>(Result.isErr);

  invalid.forEach((error) => console.error(error.getErr()));

  if (invalid.length > 0) {
    process.exit(1);
  }
}
