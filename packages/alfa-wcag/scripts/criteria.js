const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

const specifications = [
  ["2.0", "https://www.w3.org/TR/WCAG20/"],
  ["2.1", "https://www.w3.org/TR/WCAG/"],
  ["2.2", "https://www.w3.org/TR/WCAG22/"],
];

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();
  const criteria = {};

  for (const [version, specification] of specifications) {
    await page.goto(specification);

    const data = await page.evaluate(() =>
      [...document.querySelectorAll(".sc")].map((criterion, i) => {
        const heading = criterion.querySelector("h4, .sc-handle");

        const [, chapter, title] = heading.textContent.match(
          /(\d\.\d\.\d{1,2}) ([^§:]+)/
        );

        const id = criterion.id;

        const [, level] = criterion.textContent.match(/\(Level (A{1,3})\)/);

        return {
          chapter,
          id,
          title,
          level,
        };
      })
    );

    for (const { chapter, id, title, level } of data) {
      criteria[chapter] = criteria[chapter] ?? {
        title,
        versions: Object.fromEntries(
          specifications.map(([version]) => [version, null])
        ),
      };

      criteria[chapter].versions[version] = {
        uri: `${specification}#${id}`,
        level,
      };
    }
  }

  let code = `
// This file has been automatically generated based on the WCAG specification.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/criteria.js\` and run \`yarn generate\` to rebuild this file.

export type Criteria = typeof Criteria;

export const Criteria = ${JSON.stringify(criteria, null, 2)} as const;
  `;

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "../src/criterion/data.ts"), code);

  browser.close();
});
