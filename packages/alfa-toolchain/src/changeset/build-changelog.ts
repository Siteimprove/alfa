import { Map } from "@siteimprove/alfa-map";

import { Changeset } from "./get-changeset-details";

/**
 * @public
 */
export namespace Changelog {
  export function buildLine(
    changeset: Changeset.Details,
    prLink: string,
    subdirectories: Map<string, string> = Map.empty(),
    prefix: string = "@siteimprove"
  ): string {
    return `- ${changeset.packages
      .map(linkToPackage(prefix, subdirectories))
      .join(", ")}: ${
      // Remove any trailing dot, then add one.
      changeset.summary.trimEnd().replace(/\.$/, "")
    }. (${prLink})`;
  }

  /**
   * Turns "@siteimprove/package-name" into a Markdown link to its changelog from
   * the top-level directory.
   *
   * @remarks
   * When we pre-process changesets, we do not yet know the new version number.
   * So we use a placeholder to be replaced at a later stage.
   */
  function linkToPackage(
    prefix: string,
    subdirectories: Map<string, string>
  ): (fullName: string) => string {
    return (fullName) => {
      const shortName = fullName.replace(prefix, "");
      return `[${fullName}](${subdirectories
        .get(shortName)
        .getOr(
          "packages"
        )}/${shortName}/CHANGELOG.md#[INSERT NEW VERSION HERE])`;
    };
  }

  export function buildBody(
    changesets: Array<[changeset: Changeset.Details, prLink: string]>,
    prefix: string = "@siteimprove",
    subdirectories: Map<string, string> = Map.empty()
  ): string {
    const sorted: {
      [kind in Changeset.Kind]: Array<
        [changeset: Changeset.Details, prLink: string]
      >;
    } = { Added: [], Breaking: [], Fixed: [], Removed: [] };

    changesets.forEach((item) => sorted[item[0].kind].push(item));

    return `${(["Breaking", "Removed", "Added", "Fixed"] as const).map((kind) =>
      sorted[kind].length === 0
        ? ""
        : buildGroup(kind, sorted[kind], prefix, subdirectories)
    )}`;
  }

  /**
   * @internal
   */
  export function buildGroup(
    kind: Changeset.Kind,
    changesets: Array<[changeset: Changeset.Details, prLink: string]>,
    prefix: string = "@siteimprove",
    subdirectories: Map<string, string> = Map.empty()
  ): string {
    return `### ${kind}\n\n${changesets
      .map(([changeset, prLink]) =>
        buildLine(changeset, prLink, subdirectories, prefix)
      )
      .join("\n\n")}`;
  }
}
