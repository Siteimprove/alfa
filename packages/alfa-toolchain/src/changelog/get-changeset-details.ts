import { NewChangeset } from "@changesets/types";
import { Err, Result } from "@siteimprove/alfa-result";

/**
 * @internal
 */
export const kinds = [
  "Added",
  "Breaking",
  "Removed",
  "Changed",
  "Fixed",
] as const;
type Kind = typeof kinds[number];

function isKind(name: string): name is Kind {
  return kinds.some((kind) => kind === name);
}

type ChangesetDetails = {
  kind: Kind;
  packages: Array<string>;
  summary: string;
  details?: string;
};

/**
 * Extract details from a changeset
 *
 * @remarks
 * The changeset.summary must match:
 * > **[kind]:** [summary]
 * >
 * > [details?]
 *
 * @public
 */
export function getChangesetDetails(
  changeset: NewChangeset
): Result<ChangesetDetails, string> {
  const matches = changeset.summary.match(
    /**
     * '**'
     * capture group (1) for potential kind (any letters)
     * ':**'
     * capture group (2) for details (everything up to first newline excluded)
     * non-capture group, optional of:
     *   two newlines (end of details, empty line)
     *   capture group (3) for all the rest of the details
     */
    /[*][*]([a-zA-Z]*):[*][*] ([^\n]*)(?:\n\n((?:.|\n)*))?/
  );

  if (matches === null) {
    return Err.of("Changeset doesn't match the required format");
  }

  const [_, kind, summary, details = ""] = matches;

  if (!isKind(kind)) {
    return Err.of(`Invalid kind: ${kind}`);
  }

  return Result.of({
    kind,
    summary,
    details,
    packages: changeset.releases.map((release) => release.name),
  });
}
