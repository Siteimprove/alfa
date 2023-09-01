import assembleReleasePlan from "@changesets/assemble-release-plan";
import { getInfo } from "@changesets/get-github-info";
import type {
  Config,
  NewChangesetWithCommit,
  ReleasePlan,
} from "@changesets/types";
import type { Package, Packages } from "@manypkg/get-packages";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { Changeset } from "./get-changeset-details";
import type { ChangelogFunctions } from "./changelog-global";

/**
 * @public
 */
export namespace Changelog {
  export async function getBody(
    changesets: Array<NewChangesetWithCommit>,
    packages: Packages,
    config: Config
  ): Promise<string> {
    // Build release plan (compute old and new versions for each package)
    const releasePlan = assembleReleasePlan(
      changesets,
      packages,
      config,
      undefined,
      undefined
    );

    // Check unicity of versions
    const versions = getVersions(releasePlan);
    if (!versions.isOk()) {
      console.error(versions.getErrUnsafe());
      process.exit(3);
    }

    const { oldVersion, newVersion } = versions.get();
    console.log(`Going from ${oldVersion} to ${newVersion}`);

    // Check that changeset config.changelog[1].repo exists, so we can fetch
    // the PRs.
    const changelog = config.changelog;
    if (changelog === false) {
      console.error(
        "Changeset config.changelog is not in the correct format (missing options)"
      );
      process.exit(1);
    }
    const repo = changelog[1]?.repo;

    if (typeof repo !== "string") {
      console.error(
        "Changeset config.changelog is not in the correct format (missing repo)"
      );
      process.exit(1);
    }

    // Build links to PRs, this is an array of same length as the changesets
    // with a one-to-one correspondence.
    const prLinks = await getPRlinks(changesets, repo);

    // Parse the changeset and extract the details.
    const details = changesets
      .map(Changeset.getDetails)
      .filter<Ok<Changeset.Details>>(Result.isOk)
      .map((changeset) => changeset.get());

    if (details.length !== changesets.length) {
      console.error("Some changesets are invalid");
      process.exit(4);
    }

    // Build the body of the global changelog.
    return Changelog.buildBody(
      details.map((detail, idx) => [detail, prLinks[idx]]),
      packages.packages
    );
  }

  interface Versions {
    oldVersion: string;
    newVersion: string;
  }
  function getVersions(releasePlan: ReleasePlan): Result<Versions, string> {
    return releasePlan.releases.reduce(
      (previous: Result<Versions, string>, current) => {
        return previous.flatMap(({ oldVersion, newVersion }) => {
          if (oldVersion !== "" && oldVersion !== current.oldVersion) {
            return Err.of(
              "Not all packages have the same current version, aborting"
            );
          }
          if (newVersion !== "" && newVersion !== current.newVersion) {
            return Err.of(
              "Not all packages have the same future version, aborting"
            );
          }

          return Ok.of({
            oldVersion: current.oldVersion,
            newVersion: current.newVersion,
          });
        });
      },
      Ok.of({ oldVersion: "", newVersion: "" })
    );
  }

  async function getPRlinks(
    changesets: Array<NewChangesetWithCommit>,
    repo: string
  ): Promise<Array<string | undefined>> {
    return Promise.all(
      changesets.map((changeset) => getPRLink(repo)(changeset.commit))
    );
  }

  function getPRLink(
    repo: string
  ): (commit: string | undefined) => Promise<string | undefined> {
    return async (commit) =>
      commit === undefined
        ? undefined
        : getInfo({ commit, repo }).then(
            (info) => info?.links.pull ?? undefined
          );
  }
  /**
   * Builds the global changelog body, from an array of changesets.
   *
   * @remarks
   * When we pre-process changesets, we do not yet know the new version number.
   * So we use a placeholder to be replaced at a later stage.
   */
  export function buildBody(
    changesets: ReadonlyArray<
      [changeset: Changeset.Details, prLink: string | undefined]
    >,
    packages: ReadonlyArray<Package>
  ): string {
    const sorted: {
      [kind in Changeset.Kind]: Array<
        [changeset: Changeset.Details, prLink: string | undefined]
      >;
    } = { Added: [], Breaking: [], Fixed: [], Removed: [] };

    changesets.forEach((item) => sorted[item[0].kind].push(item));

    return `${(["Breaking", "Removed", "Added", "Fixed"] as const)
      .map((kind) =>
        sorted[kind].length === 0
          ? ""
          : buildGroup(kind, sorted[kind], packages)
      )
      .filter((group) => group !== "")
      .join("\n\n")}`;
  }

  /**
   * Builds a global changelog entry from a changeset.
   *
   * @internal
   */
  export function buildLine(
    changeset: Changeset.Details,
    prLink: string | undefined,
    packages: ReadonlyArray<Package>
  ): string {
    return `- ${changeset.packages.map(linkToPackage(packages)).join(", ")}: ${
      // Remove trailing dot, if any, then add one.
      changeset.title.trimEnd().replace(/\.$/, "")
    }.${prLink === undefined ? "" : ` (${prLink})`}`;
  }

  /**
   * Turns "package-name" into a Markdown link to its changelog from the
   * top-level directory.
   */
  function linkToPackage(
    packages: ReadonlyArray<Package>
  ): (fullName: string) => string {
    return (fullName) => {
      const packageJSON = packages.find((p) => p.packageJson.name === fullName)!
        .packageJson as { [key: string]: any };

      return `[${fullName}](${packageJSON?.repository?.directory}/CHANGELOG.md#[INSERT NEW VERSION HERE])`;
    };
  }
  /**
   * @internal
   */
  export function buildGroup(
    kind: Changeset.Kind,
    changesets: ReadonlyArray<
      [changeset: Changeset.Details, prLink: string | undefined]
    >,
    packages: ReadonlyArray<Package>
  ): string {
    return `### ${kind}\n\n${changesets
      .map(([changeset, prLink]) => buildLine(changeset, prLink, packages))
      .join("\n\n")}`;
  }
}

const changelogFunctions: ChangelogFunctions = {
  getBody: Changelog.getBody,
};

export default changelogFunctions;
