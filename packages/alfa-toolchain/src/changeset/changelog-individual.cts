/**
 * Generate changelog entries for individual packages, based on changesets.
 *
 * @remarks
 * This is a copy of @svitejs/changesets-changelog-github-compact, removing
 * getDependencyReleaseLine. Since we keep all our packages at the same version,
 * there is no need to add changelog entries for (internal) dependency bumps.
 */
import type { ChangelogFunctions } from "@changesets/types";
const changelog = require("@svitejs/changesets-changelog-github-compact");

/**
 * @public
 */
const changelogFunctions: ChangelogFunctions = {
  getDependencyReleaseLine: async () => "",
  getReleaseLine: changelog.getReleaseLine,
};

/**
 * @public
 */
module.exports = changelogFunctions;
