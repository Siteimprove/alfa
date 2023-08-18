/// <reference lib="dom" />
/// <reference types="node" />
import getChangeSets from "@changesets/read";

import { getChangesetDetails } from "./get-changeset-details";

const targetPath = process.argv[2] ?? ".";

main();

async function main() {
  const changesets = await getChangeSets(targetPath);

  const test = changesets[0];
  console.dir(test);

  console.dir(getChangesetDetails(test));
}
