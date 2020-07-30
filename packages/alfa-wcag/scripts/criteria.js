const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const axios = require("axios");

const url =
  "https://raw.githubusercontent.com/w3c/wai-wcag-quickref/gh-pages/_data/wcag21.json";

axios.get(url).then(({ data }) => {
  const criteria = data.principles.flatMap((p) =>
    p.guidelines.flatMap((g) =>
      g.successcriteria.map((c) => {
        return [
          c.num,
          {
            uri: c.id.replace("WCAG2:", "https://www.w3.org/TR/WCAG/#"),
            title: c.handle,
            level: c.level,
            versions: c.versions,
          },
        ];
      })
    )
  );

  let code = `
    // This file has been automatically generated based on the WCAG Quick Reference
    // data. Do therefore not modify it directly! If you wish to make changes, do so
    // in \`scripts/criteria.js\` and run \`yarn generate\` to rebuild this file.

    import { Criterion } from "../criterion";

    export type Criteria = typeof Criteria;

    export const Criteria = {
      ${criteria
        .map(
          ([chapter, criterion]) =>
            `"${chapter}": {
              uri: "${criterion.uri}",
              title: "${criterion.title}",
              level: "${criterion.level}" as Criterion.Level,
              versions: [${criterion.versions
                .map((version) => `"${version}"`)
                .join(", ")}] as Array<Criterion.Version>,
            },`
        )
        .join("\n\n")}
    };
  `;

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "../src/criterion/data.ts"), code);
});
