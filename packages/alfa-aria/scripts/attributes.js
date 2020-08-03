const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();

  await page.goto("https://www.w3.org/TR/wai-aria/");

  const attributes = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll(".property, .state")].map(
        (attribute, i) => {
          const key = attribute
            .querySelector(".property-name, .state-name")
            .getAttribute("title");

          const type = attribute.matches(".property") ? "property" : "state";

          const value = attribute
            .querySelector(".property-value, .state-value")
            .textContent.toLowerCase()
            .replace(/[\s//]/g, "-");

          const fallback =
            attribute
              .querySelector(".value-name .default")
              ?.textContent.replace(/\(default\):?/, "")
              .trim() ?? null;

          const options = [
            ...attribute.querySelectorAll(".value-name"),
          ].map((option) =>
            option.textContent.replace(/\(default\):?/, "").trim()
          );

          return [
            key,
            {
              index: 0,
              type,
              value,
              options,
              default: fallback,
            },
          ];
        }
      )
    )
  );

  let index = 0;

  for (const name in attributes) {
    attributes[name].index = index++;
  }

  let code = `
// This file has been automatically generated based on the WAI-ARIA specification.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/attributes.js\` and run \`yarn generate\` to rebuild this file.

export type Attributes = typeof Attributes;

export const Attributes = ${JSON.stringify(attributes, null, 2)} as const;
  `;

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "../src/attribute/data.ts"), code);

  browser.close();
});
