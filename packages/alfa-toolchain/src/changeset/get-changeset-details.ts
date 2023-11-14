import { NewChangeset } from "@changesets/types";
import { Err, Result } from "@siteimprove/alfa-result";

/**
 * @public
 */
export namespace Changeset {
  /**
   * @internal
   */
  export const kinds = [
    "Added",
    "Breaking",
    "Changed",
    "Removed",
    "Fixed",
  ] as const;
  export type Kind = (typeof kinds)[number];

  function isKind(name: string): name is Kind {
    return kinds.some((kind) => kind === name);
  }

  export type Details = {
    kind: Kind;
    packages: Array<string>;
    title: string;
    details?: string;
  };

  /**
   * Extract details from a changeset
   *
   * @remarks
   * The changeset.summary must match:
   * > **[kind]:** [title]
   * >
   * > [details?]
   */
  export function getDetails(changeset: NewChangeset): Result<Details, string> {
    const matches = changeset.summary.match(
      /**
       * '**'
       * capture group <kind> (any letters)
       * ':**'
       * capture group <title> (everything up to first newline excluded)
       * non-capture group, optional of:
       *   two newlines (end of title, empty line)
       *   capture group <details> (all the rest, incl. newlines ('s' flag))
       * end of string
       */
      /[*][*](?<kind>[a-zA-Z]*):[*][*] (?<title>[^\n]*)(?:\n\n(?<details>.*))?$/s,
    );

    if (matches === null) {
      return Err.of(
        `Changeset doesn't match the required format (${changeset.summary})`,
      );
    }

    // Since the match succeeded, we are sure that groups exists
    const { kind, title, details } = matches.groups!;

    if (!isKind(kind)) {
      return Err.of(`Invalid kind: ${kind}`);
    }

    return Result.of({
      kind,
      title,
      details: details ?? "",
      packages: changeset.releases.map((release) => release.name),
    });
  }
}
