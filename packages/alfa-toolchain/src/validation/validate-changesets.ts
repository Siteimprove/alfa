import getChangeSets from "@changesets/read";
import { Err, Result } from "@siteimprove/alfa-result";

import { Changeset } from "../changeset/get-changeset-details";

/**
 * Validate that all changesets have the expected structure.
 */
export async function validateChangesets(cwd: string): Promise<Array<string>> {
  return (await getChangeSets(cwd))
    .map(Changeset.getDetails)
    .filter<Err<string>>(Result.isErr)
    .map((err) => err.getErr());
}
