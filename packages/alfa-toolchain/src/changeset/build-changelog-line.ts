import { Changeset } from "./get-changeset-details";

/**
 * @public
 */
export namespace Changelog {
  export function buildLine(
    changeset: Changeset.Details,
    prLink: string,
    subdirectory: string = "packages",
    prefix: string = "@siteimprove"
  ): string {
    return `${changeset.packages
      .map(linkToPackage(prefix, subdirectory))
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
    subdirectory: string
  ): (fullName: string) => string {
    return (fullName) =>
      `[${fullName}](${subdirectory}/${fullName.replace(
        prefix,
        ""
      )}/CHANGELOG.md#[INSERT NEW VERSION HERE])`;
  }
}
