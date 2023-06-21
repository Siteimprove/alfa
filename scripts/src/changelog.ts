/**
 * Generate changelogs from the changesets.
 * {@link https://github.com/changesets/changesets/blob/main/docs/modifying-changelog-format.md}
 *
 * @remarks
 * This is copied from {@link https://github.com/svitejs/changesets-changelog-github-compact}
 * but removing the list of dependencies updates that is cluttering the packages
 * changelogs
 */

import type {
  ChangelogFunctions,
  NewChangesetWithCommit,
  VersionType,
} from "@changesets/types";
import { getInfo, getInfoFromPullRequest } from "@changesets/get-github-info";

function validate(options: Record<string, any> | null) {
  if (!options || !options.repo) {
    throw new Error(
      'Please provide a repo to this changelog generator like this:\n"changelog": ["path/to/changelog.js", { "repo": "org/repo" }]'
    );
  }
}

async function getDependencyReleaseLine(): Promise<string> {
  return "";
}

async function getReleaseLine(
  changeset: NewChangesetWithCommit,
  type: VersionType,
  options: Record<string, any> | null
): Promise<string> {
  validate(options);
  const repo = options!.repo;
  let prFromSummary: number | undefined;
  let commitFromSummary: string | undefined;

  const replacedChangelog = changeset.summary
    .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
      const num = Number(pr);
      if (!isNaN(num)) prFromSummary = num;
      return "";
    })
    .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
      commitFromSummary = commit;
      return "";
    })
    .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, "")
    .trim();

  // add links to issue hints (fix #123) => (fix [#123](https://....))
  const linkifyIssueHints = (line: string) =>
    line.replace(/(?<=\( ?(?:fix|fixes|see) )(#\d+)(?= ?\))/g, (issueHash) => {
      return `[${issueHash}](https://github.com/${repo}/issues/${issueHash.substring(
        1
      )})`;
    });
  const [firstLine, ...futureLines] = replacedChangelog
    .split("\n")
    .map((l) => linkifyIssueHints(l.trimRight()));

  const links = await (async () => {
    if (prFromSummary !== undefined) {
      let { links } = await getInfoFromPullRequest({
        repo,
        pull: prFromSummary,
      });
      if (commitFromSummary) {
        links = {
          ...links,
          commit: `[\`${commitFromSummary}\`](https://github.com/${repo}/commit/${commitFromSummary})`,
        };
      }
      return links;
    }
    const commitToFetchFrom = commitFromSummary || changeset.commit;
    if (commitToFetchFrom) {
      const { links } = await getInfo({
        repo,
        commit: commitToFetchFrom,
      });
      return links;
    }
    return {
      commit: null,
      pull: null,
      user: null,
    };
  })();

  // only link PR or merge commit not both
  const suffix = links.pull
    ? ` (${links.pull})`
    : links.commit
    ? ` (${links.commit})`
    : "";

  return `\n- ${firstLine}${suffix}\n${futureLines
    .map((l) => `  ${l}`)
    .join("\n")}`;
}

const changelogFunctions: ChangelogFunctions = {
  getDependencyReleaseLine,
  getReleaseLine,
};

export default changelogFunctions;
