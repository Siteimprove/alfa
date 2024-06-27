import * as fs from "node:fs";
import * as path from "node:path";
import * as prettier from "prettier";
import * as puppeteer from "puppeteer";

// We need to fetch 2.2 first to populate the data with its values.
const specifications = [
  ["2.2", "https://www.w3.org/TR/WCAG2/"],
  ["2.1", "https://www.w3.org/TR/WCAG21/"],
  ["2.0", "https://www.w3.org/TR/WCAG20/"],
];

type Version = [version: string, { uri: string; level: string }];
type Criteria = {
  [chapter: string]: { title: string; versions: Array<Version> };
};

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();
  const criteria: Criteria = {};

  for (const [version, specification] of specifications) {
    await page.goto(specification);

    const data = (
      await page.evaluate(
        (version) =>
          Array.from(
            document.querySelectorAll(
              version === "2.0"
                ? ".sc"
                : // Both guidelines and criteria are section.guideline, so we
                  // need more structure in the match.
                  "section.principle section.guideline section.guideline",
            ),
          ).map((criterion) => {
            const heading = criterion.querySelector(
              version === "2.0" ? ".sc-handle" : "h4",
            );

            const [, chapter, title] = heading?.textContent?.match(
              /(\d\.\d\.\d{1,2}) ([^§:]+)/,
            ) ?? [undefined, undefined, undefined];

            const id = criterion.id;

            if (version === "2.2" && chapter === "4.1.1") {
              return { chapter, id, title, level: "Obsolete" };
            }

            const [, level] = criterion.textContent?.match(
              /\(Level (A{1,3})\)/,
            ) ?? [undefined, undefined];

            return { chapter, id, title, level };
          }),
        version,
      )
    ).filter(
      (
        value,
      ): value is {
        chapter: string;
        id: string;
        title: string;
        level: string;
      } =>
        value.chapter !== undefined &&
        value.title !== undefined &&
        value.level !== undefined,
    );

    for (const { chapter, id, title, level } of data.filter(
      ({ level }) => level !== "Obsolete",
    )) {
      criteria[chapter] = criteria[chapter] ?? {
        title,
        versions: [],
      };

      criteria[chapter].versions.push([
        version,
        {
          uri: `${specification}#${id}`,
          level,
        },
      ]);
    }
  }

  await browser.close();

  let code = `
// This file has been automatically generated based on the WCAG specification.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/criteria.js\` and run \`yarn generate\` to rebuild this file.

/**
 * @internal
 */
export type Criteria = typeof Criteria;

/**
 * @internal
 */
export const Criteria = ${JSON.stringify(criteria, null, 2)} as const;
  `;

  code = await prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "criterion", "data.ts"),
    code,
  );
});
