const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();

  await page.goto("https://www.w3.org/WAI/WCAG22/Techniques/");

  const techniques = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll("ul.toc-wcag-docs li a")].map(
        (technique) => {
          const uri = technique.href;

          const match = technique.textContent
            .replace(/\s+/, " ")
            .trim()
            .match(/^(\w+\d+): (.+)/);

          if (match === null) {
            return [];
          }

          const [, name, title] = match;

          return [
            name,
            {
              title,
              uri,
            },
          ];
        },
      ),
    ),
  );

  browser.close();

  let code = `
// This file has been automatically generated based on the WCAG specification.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/techniques.js\` and run \`yarn generate\` to rebuild this file.

/**
 * @internal
 */
export type Techniques = typeof Techniques;

/**
 * @internal
 */
export const Techniques = ${JSON.stringify(techniques, null, 2)} as const;
  `;

  code = await prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "technique", "data.ts"),
    code,
  );
});
