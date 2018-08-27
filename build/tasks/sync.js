const root = require("../../package.json");

/**
 * @typedef {typeof root} Manifest
 */

/**
 * These are the fields we want to keep in sync between the different package
 * manifest of packages within Alfa.
 *
 * @type {Array<keyof Manifest>}
 */
const fields = [
  "author",
  "homepage",
  "license",
  "description",
  "contributors",
  "keywords",
  "repository",
  "bugs"
];

/**
 * @param {Manifest} manifest
 * @return {Manifest}
 */
function sync(manifest) {
  const synced = Object.assign({}, manifest);

  for (const field of fields) {
    synced[field] = root[field];
  }

  return synced;
}

exports.sync = sync;
