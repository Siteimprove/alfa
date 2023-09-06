import getChangeSets from "@changesets/read";
import { Err, Result } from "@siteimprove/alfa-result";

import { Changeset } from "../changeset/get-changeset-details";

export async function validateChangesets(cwd: string, error: number) {
  const changesets = await getChangeSets(cwd);

  const invalid = changesets
    .map(Changeset.getDetails)
    .filter<Err<string>>(Result.isErr);

  invalid.forEach((error) => console.error(error.getErr()));

  if (invalid.length > 0) {
    process.exit(error);
  }
}
