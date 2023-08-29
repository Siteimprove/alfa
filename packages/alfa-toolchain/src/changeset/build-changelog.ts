import { Map } from "@siteimprove/alfa-map";

import { Changeset } from "./get-changeset-details";

/**
 * @public
 */
export namespace Changelog {
  /**
   * Builds the global changelog body, from an array of changesets.
   *
   * @remarks
   * When we pre-process changesets, we do not yet know the new version number.
   * So we use a placeholder to be replaced at a later stage.
   */
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

    return `${(["Breaking", "Removed", "Added", "Fixed"] as const)
      .map((kind) =>
        sorted[kind].length === 0
          ? ""
          : buildGroup(kind, sorted[kind], prefix, subdirectories)
      )
      .join("")}`;
  }

  /**
   * Builds a global changelog entry from a changeset.
   *
   * @internal
   */
  export function buildLine(
    changeset: Changeset.Details,
    prLink: string,
    subdirectories: Map<string, string> = Map.empty(),
    prefix: string = "@siteimprove"
  ): string {
    return `- ${changeset.packages
      .map(linkToPackage(prefix, subdirectories))
      .join(", ")}: ${
      // Remove trailing dot, if any, then add one.
      changeset.title.trimEnd().replace(/\.$/, "")
    }. (${prLink})`;
  }

  /**
   * Turns "<prefix>/package-name" into a Markdown link to its changelog from
   * the top-level directory.
   *
   * @remarks
   * When we pre-process changesets, we do not yet know the new version number.
   * So we use a placeholder to be replaced at a later stage.
   *
   * @privateRemarks
   * We need to know in which sub-directory the package source code is located.
   * The default is "packages".
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
