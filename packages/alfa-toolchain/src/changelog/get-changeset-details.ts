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
     * capture group <kind> (any letters)
     * ':**'
     * capture group <summary> (everything up to first newline excluded)
     * non-capture group, optional of:
     *   two newlines (end of summary, empty line)
     *   capture group <details> (all the rest, incl. newlines ('s' flag))
     * end of string
     */
    /[*][*](?<kind>[a-zA-Z]*):[*][*] (?<summary>[^\n]*)(?:\n\n(?<details>.*))?$/s
  );

  if (matches === null) {
    return Err.of(
      `Changeset doesn't match the required format (${changeset.summary})`
    );
  }

  // Since the match succeeded, we are sure that groups exists
  const { kind, summary, details } = matches.groups!;

  if (!isKind(kind)) {
    return Err.of(`Invalid kind: ${kind}`);
  }

  return Result.of({
    kind,
    summary,
    details: details ?? "",
    packages: changeset.releases.map((release) => release.name),
  });
}
