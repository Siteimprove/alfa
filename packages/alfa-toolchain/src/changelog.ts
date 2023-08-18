import type { ChangelogFunctions } from "@changesets/types";
import changelog from "@svitejs/changesets-changelog-github-compact";

const changelogFunctions: ChangelogFunctions = {
  getDependencyReleaseLine: async () => "",
  getReleaseLine: changelog.getReleaseLine,
};

export default changelogFunctions;
