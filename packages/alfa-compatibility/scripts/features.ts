import * as fs from "node:fs";
import * as path from "node:path";
import * as prettier from "prettier";
import data, { type Identifier } from "@mdn/browser-compat-data";

// This contains the list of features to generate definitions for from the MDN
// browser compatibility data. To add more features, add an entry to the JSON
// file with the path to a given feature.
// See https://github.com/mdn/browser-compat-data for the complete list of
// features available.
const include = [
  "css.properties.border-radius",
  "css.properties.color",
  "css.properties.font-weight",
  "css.types.color",
];

const { isArray } = Array;
const { keys } = Object;

interface Feature {
  key: string;
  support: Array<Support>;
}

interface Support {
  browser: string;
  added: string | boolean;
  removed: string | boolean;
}

const get = (key: string): Identifier => {
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

const version = (
  version: string | boolean | null | undefined,
): string | boolean =>
  typeof version === "string"
    ? `"${version}"`
    : version === undefined || version === null
      ? false
      : version;

const features: Array<Feature> = [];

function parse(key: string) {
  const feature = get(key);
  const compatibility = feature.__compat;

  if (compatibility === undefined) {
    return;
  }

  const support: Array<Support> = [];

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
      .filter((statement) => {
        return (
          statement.version_added !== null &&
          statement.version_added !== false &&
          statement.prefix === undefined &&
          statement.partial_implementation !== true &&
          (statement.flags === undefined || statement.flags.length === 0)
        );
      })
      .map((statement) => {
        const { version_added: added, version_removed: removed } = statement;
        return {
          added: version(added),
          removed: version(removed),
        };
      });

    if (mapped.length === 1) {
      const { added, removed } = mapped[0];

      support.push({ browser, added, removed });
    }
  }

  features.push({
    key,
    support,
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

features.sort((a, b) => (a.key > b.key ? 1 : a.key < b.key ? -1 : 0));

const code = `
// This file has been automatically generated based on the MDN browser
// compatibility data. Do therefore not modify it directly! If you wish to make
// changes, do so in \`scripts/features.js\` and run \`yarn generate\` to rebuild this
// file.

/**
 * @internal
 */
export type Features = typeof Features;

/**
 * @internal
 */
export const Features = {
  ${features
    .map(
      (feature) => `
        "${feature.key}": {
          support: {
            ${feature.support
              .map(
                (support) => `
                  "${support.browser}": {
                    added: ${support.added} as const
                    ${
                      support.removed
                        ? `, removed: ${support.removed} as const`
                        : ""
                    }
                  }
                `,
              )
              .join(",\n")}
          }
        }
      `,
    )
    .join(",\n\n")}
};
`;

prettier
  .format(code, { parser: "typescript" })
  .then((code) =>
    fs.writeFileSync(
      path.join(import.meta.dirname, "..", "src", "feature", "data.ts"),
      code,
    ),
  );
