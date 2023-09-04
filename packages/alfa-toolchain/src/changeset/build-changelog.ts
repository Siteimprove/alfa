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
import {
  type ChangelogFunctions,
  Error,
  getConfigOption,
  getOrDie,
} from "./helpers";

const NON_UNIQUE_VERSION = Error.freeFrom + 1;
const INVALID_CHANGESETS = Error.freeFrom + 2;

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
    const { oldVersion, newVersion } = getOrDie(
      getVersions(releasePlan),
      NON_UNIQUE_VERSION
    );

    // Check that changeset config.changelog[1].repo exists, so we can fetch
    // the PRs.
    const repo = getConfigOption(config, "repo");

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
      process.exit(INVALID_CHANGESETS);
    }

    // Build the body of the global changelog.
    return (
      `## [${newVersion}](../../compare/v${oldVersion}...v${newVersion}) (${new Date(
        Date.now()
      )
        .toISOString()
        .slice(0, 10)})` +
      "\n\n" +
      Changelog.buildBody(
        details.map((detail, idx) => [detail, prLinks[idx]]),
        packages.packages,
        newVersion
      )
    );
  }

  interface Versions {
    oldVersion: string;
    newVersion: string;
  }

  type ChangeSetDetailsWithLink = [
    changeset: Changeset.Details,
    prLink: string | undefined
  ];

  /**
   * Builds the global changelog body, from an array of changesets.
   *
   * @remarks
   * When we pre-process changesets, we do not yet know the new version number.
   * So we use a placeholder to be replaced at a later stage.
   */
  export function buildBody(
    changesets: ReadonlyArray<ChangeSetDetailsWithLink>,
    packages: ReadonlyArray<Package>,
    newVersion: string
  ): string {
    const sorted: {
      [kind in Changeset.Kind]: Array<ChangeSetDetailsWithLink>;
    } = { Added: [], Breaking: [], Fixed: [], Removed: [] };

    changesets.forEach((item) => sorted[item[0].kind].push(item));

    return `${(["Breaking", "Removed", "Added", "Fixed"] as const)
      .map((kind) =>
        sorted[kind].length === 0
          ? ""
          : buildGroup(kind, sorted[kind], packages, newVersion)
      )
      .filter((group) => group !== "")
      .join("\n\n")}`;
  }

  /**
   * @internal
   */
  export function buildGroup(
    kind: Changeset.Kind,
    changesets: ReadonlyArray<ChangeSetDetailsWithLink>,
    packages: ReadonlyArray<Package>,
    newVersion: string
  ): string {
    return `### ${kind}\n\n${changesets
      .map(buildLine(packages, newVersion))
      .join("\n\n")}`;
  }

  /**
   * Builds a global changelog entry from a changeset.
   *
   * @internal
   */
  export function buildLine(
    packages: ReadonlyArray<Package>,
    newVersion: string
  ): ([changeset, prLink]: ChangeSetDetailsWithLink) => string {
    return ([changeset, prLink]) =>
      `- ${changeset.packages
        .map(linkToPackage(packages, newVersion))
        .join(", ")}: ${
        // Remove trailing dot, if any, then add one.
        changeset.title.trimEnd().replace(/\.$/, "")
      }.${prLink === undefined ? "" : ` (${prLink})`}`;
  }

  /**
   * Turns "package-name" into a Markdown link to its changelog from the
   * top-level directory.
   *
   * @remarks
   * The version is sent as a full semver X.Y.Z. However, Github links to markdown
   * headings strip the dots.
   */
  function linkToPackage(
    packages: ReadonlyArray<Package>,
    newVersion: string
  ): (fullName: string) => string {
    return (fullName) => {
      // The non-null assertion is wrong if a package is deleted but still
      // mentioned in a changeset.
      const packageJSON =
        // The type assertion is needed as we know our package.json have a
        // repository.directory field, but manypkg.get-packages totally ignores
        // that it may even exist.
        packages.find((p) => p.packageJson.name === fullName)!.packageJson as {
          [key: string]: any;
        };

      return `[${fullName}](${
        // Harden the access against non-existent packages or invalid
        // package.json; this still leaks an undefined in the Changelog.
        packageJSON?.repository?.directory
      }/CHANGELOG.md#${newVersion.replace(/\./g, "")})`;
    };
  }

  /**
   * Check that old and new versions are unique in a release plan, and return them.
   */
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

          return Ok.of(current);
        });
      },
      Ok.of({ oldVersion: "", newVersion: "" })
    );
  }

  /**
   * Get links to PRs that added the given changesets to the repo.
   *
   * @privateRemarks
   * Trying to bake Result into that gets messy because of the interleaving
   * of Result and (native) Promise.
   */
  async function getPRlinks(
    changesets: Array<NewChangesetWithCommit>,
    repo: string
  ): Promise<Array<string | undefined>> {
    return Promise.all(
      changesets.map((changeset) => getPRLink(repo)(changeset.commit))
    );
  }

  /**
   * Get a markdown formatted link to the PR that added a given commit.
   */
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
}

const changelogFunctions: ChangelogFunctions = {
  getBody: Changelog.getBody,
  insertBody(oldBody: string, newBody: string): string {
    return newBody + "\n\n" + oldBody;
  },
};

export default changelogFunctions;
