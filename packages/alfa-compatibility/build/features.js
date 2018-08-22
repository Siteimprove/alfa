import * as fs from "fs";
import * as prettier from "prettier";
import data from "mdn-browser-compat-data";

// This contains the list of features to generate definitions for from the MDN
// browser compatibility data. To add more features, add an entry to the JSON
// file with the path to a given feature.
// See https://github.com/mdn/browser-compat-data for the complete list of
// features available.
const include = require("./features.json");

const { isArray } = Array;
const { keys } = Object;

const get = key => key.split(".").reduce((data, key) => data[key], data);

const version = version =>
  typeof version === "string" ? `"${version}"` : version;

const features = [];

function parse(key) {
  const feature = get(key);
  const compatibility = feature.__compat;

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

    if (!isArray(statements)) {
      statements = [statements];
    }

    statements = statements
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
        return {
          added: statement.version_added,
          removed: statement.version_removed
        };
      });

    if (statements.length === 1) {
      support.push({ browser, ...statements[0] });
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
// changes, do so in \`build/features.js\` and run \`yarn prepare\` to rebuild this
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
                    added: ${version(support.added)}
                    ${
                      support.removed
                        ? `, removed: ${version(support.removed)}`
                        : ""
                    }
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
