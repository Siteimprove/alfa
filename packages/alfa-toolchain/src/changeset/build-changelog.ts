import assembleReleasePlan from "@changesets/assemble-release-plan";
import { getInfo } from "@changesets/get-github-info";
import { getCommitsThatAddFiles } from "@changesets/git";
import type {
  Config,
  NewChangeset,
  NewChangesetWithCommit,
  ReleasePlan,
} from "@changesets/types";
import type { Packages } from "@manypkg/get-packages";
import { Map } from "@siteimprove/alfa-map";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { Changeset } from "./get-changeset-details";
import type { ChangelogFunctions } from "./changelog-global";

/**
 * @public
 */
export namespace Changelog {
  export async function getBody(
    cwd: string,
    changesets: Array<NewChangesetWithCommit>,
    packages: Packages,
    config: Config
  ): Promise<string> {
    const releasePlan = assembleReleasePlan(
      changesets,
      packages,
      config,
      undefined,
      undefined
    );

    const versions = getVersions(releasePlan);
    if (!versions.isOk()) {
      console.error(versions.getErrUnsafe());
      process.exit(3);
    }

    const { oldVersion, newVersion } = versions.get();
    console.log(`Going from ${oldVersion} to ${newVersion}`);

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

    const prLinks = await getPRlinks(cwd, changesets, repo);

    const details = changesets
      .map(Changeset.getDetails)
      .filter<Ok<Changeset.Details>>(Result.isOk)
      .map((changeset) => changeset.get());

    if (details.length !== changesets.length) {
      console.error("Some changesets are invalid");
      process.exit(2);
    }

    return Changelog.buildBody(
      details.map((detail, idx) => [detail, prLinks[idx]])
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
    cwd: string,
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
    changesets: Array<
      [changeset: Changeset.Details, prLink: string | undefined]
    >,
    prefix: string = "@siteimprove",
    subdirectories: Map<string, string> = Map.empty()
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
          : buildGroup(kind, sorted[kind], prefix, subdirectories)
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
    subdirectories: Map<string, string> = Map.empty(),
    prefix: string = "@siteimprove"
  ): string {
    return `- ${changeset.packages
      .map(linkToPackage(prefix, subdirectories))
      .join(", ")}: ${
      // Remove trailing dot, if any, then add one.
      changeset.title.trimEnd().replace(/\.$/, "")
    }.${prLink === undefined ? "" : ` (${prLink})`}`;
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
      const shortName = fullName.replace(`${prefix}/`, "");
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
    changesets: Array<
      [changeset: Changeset.Details, prLink: string | undefined]
    >,
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

const changelogFunctions: ChangelogFunctions = {
  getBody: Changelog.getBody,
};

export default changelogFunctions;
