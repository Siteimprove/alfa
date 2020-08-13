const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();

  await page.goto("https://www.w3.org/TR/WCAG/");

  const criteria = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll(".sc")].map((criterion, i) => {
        const heading = criterion.querySelector("h4");

        const [, chapter, title] = heading.textContent.match(
          /Success Criterion (\d\.\d\.\d{1,2}) ([^§]+)/
        );

        const uri = heading.querySelector("a").href;

        const [, level] = criterion
          .querySelector(".conformance-level")
          .textContent.match(/\(Level (A{1,3})\)/);

        return [
          chapter,
          {
            index: 0,
            uri,
            title,
            level,
          },
        ];
      })
    )
  );

  let index = 0;

  for (const name in criteria) {
    criteria[name].index = index++;
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
