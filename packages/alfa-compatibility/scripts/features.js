const fs = require("fs");
const prettier = require("prettier");
const data = require("mdn-browser-compat-data");

// This contains the list of features to generate definitions for from the MDN
// browser compatibility data. To add more features, add an entry to the JSON
// file with the path to a given feature.
// See https://github.com/mdn/browser-compat-data for the complete list of
// features available.
const include = require("./features.json");

const { isArray } = Array;
const { keys } = Object;

/**
 * @typedef {object} Feature
 * @prop {string} key
 * @prop {Array<Support>} support
 */

/**
 * @typedef {object} Support
 * @prop {string} browser
 * @prop {string | boolean} added
 * @prop {string | boolean} removed
 */

/**
 * @param {string} key
 * @return {import("mdn-browser-compat-data/types").Identifier}
 */
const get = key => {
  const [entry, ...keys] = key.split(".");

  switch (entry) {
    case "css":
      return keys.reduce((data, key) => {
        const api = data[key];

        if (api === undefined) {
          throw new Error(`Unknown API "${key}"`);
        }

        return api;
      }, data[entry]);
  }

  throw new Error(`Unknown API "${entry}"`);
};

/**
 * @param {string | boolean | null | undefined} version
 * @return {string | boolean}
 */
const version = version =>
  typeof version === "string"
    ? `"${version}"`
    : version === undefined || version === null
    ? false
    : version;

/**
 * @type {Array<Feature>}
 */
const features = [];

/**
 * @param {string} key
 */
function parse(key) {
  const feature = get(key);
  const compatibility = feature.__compat;

  if (compatibility === undefined) {
    return;
  }

  /**
   * @type {Array<Support>}
   */
  const support = [];

  for (const browser of keys(compatibility.support)) {
    switch (browser) {
      case "chrome":
      case "edge":
      case "firefox":
      case "ie":
      case "opera":
      case "safari":
        break;
      default:
        continue;
    }

    let statements = compatibility.support[browser];

    if (statements === undefined) {
      continue;
    }

    if (!isArray(statements)) {
      statements = [statements];
    }

    const mapped = statements
      .filter(statement => {
        return (
          statement.version_added !== null &&
          statement.version_added !== false &&
          statement.prefix === undefined &&
          statement.partial_implementation !== true &&
          (statement.flags === undefined || statement.flags.length === 0)
        );
      })
      .map(statement => {
        const { version_added: added, version_removed: removed } = statement;
        return {
          added: version(added),
          removed: version(removed)
        };
      });

    if (mapped.length === 1) {
      const { added, removed } = mapped[0];

      support.push({ browser, added, removed });
    }
  }

  features.push({
    key,
    support
  });

  for (const subkey of keys(feature)) {
    if (subkey !== "__compat") {
      parse(`${key}.${subkey}`);
    }
  }
}

for (const key of include) {
  parse(key);
}

let code = `
// This file has been automatically generated based on the MDN browser
// compatibility data. Do therefore not modify it directly! If you wish to make
// changes, do so in \`scripts/features.js\` and run \`yarn prepare\` to rebuild this
// file.

import { Feature } from "./types";

/**
 * Names of browser features for which we have compatibility data. These names
 * correspond to a path to a browser feature in the MDN browser compatibility
 * data.
 *
 * @see https://github.com/mdn/browser-compat-data#usage
 */
export type FeatureName = ${features
  .map(feature => `"${feature.key}"`)
  .join("|")};

/**
 * @internal
 */
export const Features: { [P in FeatureName]: Feature } = {
  ${features
    .map(
      feature => `
        "${feature.key}": {
          support: {
            ${feature.support
              .map(
                support => `
                  "${support.browser}": {
                    added: ${support.added}
                    ${support.removed ? `, removed: ${support.removed}` : ""}
                  }
                `
              )
              .join(",\n")}
          }
        }
      `
    )
    .join(",\n\n")}
};
`;

code = prettier.format(code, {
  parser: "typescript"
});

fs.writeFileSync("src/features.ts", code);
