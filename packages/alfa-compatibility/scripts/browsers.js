const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const data = require("@mdn/browser-compat-data");

const include = ["chrome", "edge", "firefox", "ie", "opera", "safari"];

const { keys } = Object;

const browsers = [];

for (const name of include) {
  const browser = data.browsers[name];

  const releases = [];

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

code = await prettier.format(code, {
  parser: "typescript",
});

fs.writeFileSync(path.join(__dirname, "..", "src", "browser", "data.ts"), code);
