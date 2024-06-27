import getChangeSets from "@changesets/read";
import type { NewChangeset } from "@changesets/types";
import { Array } from "@siteimprove/alfa-array";
import { None, Option } from "@siteimprove/alfa-option";
import { Err, Result } from "@siteimprove/alfa-result";

import { Changeset } from "../changeset/get-changeset-details.js";

/**
 * Validate that all changesets have the expected structure.
 *
 * @public
 */
export async function validateChangesets(
  cwd: string,
  forbidMajor: boolean = false,
): Promise<Array<string>> {
  const errors: Array<string> = [];

  const changesets = await getChangeSets(cwd);

  errors.push(
    ...changesets
      .map(Changeset.getDetails)
      .filter<Err<string>>(Result.isErr)
      .map((err) => err.getErr()),
  );

  if (forbidMajor) {
    errors.push(
      ...Array.collect(changesets, (changeset) =>
        isMajor(changeset)
          ? Option.of(
              `Major bumps not allowed while on version 0: ${changeset.id}`,
            )
          : None,
      ),
    );
  }

  return errors;
}

function isMajor(changeset: NewChangeset): boolean {
  return changeset.releases.some((release) => release.type === "major");
}
