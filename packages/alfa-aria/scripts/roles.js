const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

const specifications = [
  "https://www.w3.org/TR/wai-aria-1.2/",
  "https://www.w3.org/TR/graphics-aria/",
  "https://www.w3.org/TR/dpub-aria/",
];

puppeteer.launch().then(async (browser) => {
  const page = await browser.newPage();
  const roles = {};

  for (const specification of specifications) {
    await page.goto(specification);

    Object.assign(
      roles,
      await page.evaluate(() => {
        function hash(href) {
          return href.substring(href.indexOf("#") + 1);
        }

        return Object.fromEntries(
          [...document.querySelectorAll(".role")].map((role) => {
            const key = role.querySelector(".role-name").getAttribute("title");

            const abstract =
              role.querySelector(".role-abstract")?.textContent === "True" ??
              false;

            const inherited = [
              ...role.querySelectorAll(".role-parent code"),
            ].map((code) => code.textContent);

            const supported = [
              ...role.querySelectorAll(`
                .role-properties .property-reference,
                .role-properties .state-reference
              `),
            ].map((reference) => hash(reference.getAttribute("href")));

            const required = [
              ...role.querySelectorAll(`
                .role-required-properties .property-reference,
                .role-required-properties .state-reference
              `),
            ].map((reference) => hash(reference.getAttribute("href")));

            const values = new Map(
              [
                ...role.querySelectorAll(`
                .implicit-values .property-reference,
                .implicit-values .state-reference
              `),
              ].map((reference) => {
                const key = hash(reference.getAttribute("href"));
                const value = reference.nextElementSibling.textContent;

                return [key, value];
              })
            );

            const attributes = [
              ...new Set([...supported, ...required, ...values.keys()].sort()),
            ].map((attribute) => {
              return [
                attribute,
                {
                  required: required.includes(attribute),
                  value: values.get(attribute) ?? null,
                },
              ];
            });

            const from =
              role
                .querySelector(".role-namefrom")
                ?.textContent.trim()
                .split(/\s+/)
                .filter((from) => from !== "n/a") ?? [];

            const name = {
              required:
                role.querySelector(".role-namerequired")?.textContent ===
                  "True" ?? false,

              prohibited: from.includes("prohibited"),

              from: from.filter((method) => method !== "prohibited"),
            };

            const parent = {
              required: [
                ...role.querySelectorAll(".role-scope .role-reference"),
              ]
                .map((reference) => hash(reference.getAttribute("href")))
                .sort(),
            };

            const children = {
              presentational:
                role.querySelector("role-childpresentational")?.textContent ===
                  "True" ?? false,

              required: [
                ...role.querySelectorAll(
                  ".role-mustcontain, .role-mustcontain li"
                ),
              ]
                .map((scope) => [
                  ...scope.querySelectorAll(":scope > .role-reference"),
                ])
                .filter((references) => references.length > 0)
                .map((references) =>
                  references.map((reference) =>
                    hash(reference.getAttribute("href"))
                  )
                ),
            };

            return [
              key,
              {
                abstract,
                inherited,
                attributes,
                name,
                parent,
                children,
              },
            ];
          })
        );
      })
    );
  }

  let code = `
// This file has been automatically generated based on the various WAI-ARIA
// specifications. Do therefore not modify it directly! If you wish to make
// changes, do so in \`scripts/roles.js\` and run \`yarn generate\` to rebuild this
// file.

export type Roles = typeof Roles;

export const Roles = ${JSON.stringify(roles, null, 2)} as const;
  `;

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "../src/role/data.ts"), code);

  browser.close();
});
