import * as fs from "node:fs";
import * as path from "node:path";
import * as prettier from "prettier";
import data, { type BrowserName } from "@mdn/browser-compat-data";

const include: Array<BrowserName> = [
  "chrome",
  "edge",
  "firefox",
  "ie",
  "opera",
  "safari",
] as const;

const { keys } = Object;

interface Release {
  version: string;
  date: number;
}

const browsers: Array<{ key: BrowserName; releases: Array<Release> }> = [];

for (const name of include) {
  const browser = data.browsers[name];

  const releases: Array<Release> = [];

  for (const version of keys(browser.releases)) {
    const { status, release_date } = browser.releases[version];

    switch (status) {
      case "beta":
      case "nightly":
      case "planned":
        continue;
    }

    if (release_date === undefined) {
      continue;
    }

    releases.push({
      version,
      date: new Date(release_date).getTime(),
    });
  }

  releases.sort((a, b) => a.date - b.date);

  browsers.push({
    key: name,
    releases,
  });
}

let code = `
// This file has been automatically generated based on the MDN browser
// compatibility data. Do therefore not modify it directly! If you wish to make
// changes, do so in \`scripts/browsers.js\` and run \`yarn generate\` to rebuild this
// file.

/**
 * @internal
 */
export type Browsers = typeof Browsers;

/**
 * @internal
 */
export const Browsers = {
  ${browsers
    .map(
      (browser) => `
        "${browser.key}": {
          releases: {
            ${browser.releases
              .map(
                (release) => `
                  "${release.version}": { date: ${release.date} }
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
      path.join(__dirname, "..", "src", "browser", "data.ts"),
      code,
    ),
  );
