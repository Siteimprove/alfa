const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

const specifications = [
  // We stick to 1.2 as this is the version used by ACT rules.
  "https://www.w3.org/TR/wai-aria-1.2/",
  "https://www.w3.org/TR/graphics-aria/",
  "https://www.w3.org/TR/dpub-aria/",
];

/**
 * Grab the ARIA specification, and parses the HTML code to get the relevant bits.
 */

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
          // The `.role` class grabs each individual role section.
          // Most of the releveant data is in the table, not the text.
          [...document.querySelectorAll(".role")]
            .map((role) => {
              // This is the <h4> heading of the section
              const key = role
                .querySelector(".role-name")
                .getAttribute("title");

              // From here, we start looking at the various rows in the table,
              // the .role-* classes select the data cell and then we look at
              // its content.

              // Is it an abstract role?
              const abstract =
                role.querySelector(".role-abstract")?.textContent === "True" ??
                false;

              // Which roles does it inherit from?
              const inherited = [
                ...role.querySelectorAll(".role-parent code"),
              ].map((code) => code.textContent);

              // Grabbing the list of supported/required/prohibited attributes.
              const supported = [
                ...role.querySelectorAll(`
                .role-properties .property-reference,
                .role-properties .state-reference
              `),
              ]
                // Some supported attributes are deprecated from ARIA 1.1 to 1.2
                // Sadly they are still listed as supported, with a note, so we
                // need to parse that note :-/
                .filter(
                  (element) =>
                    !element.parentElement.textContent.includes("deprecated")
                )
                .map((reference) => hash(reference.getAttribute("href")));

              const required = [
                ...role.querySelectorAll(`
                .role-required-properties .property-reference,
                .role-required-properties .state-reference
              `),
              ].map((reference) => hash(reference.getAttribute("href")));

              const prohibited = [
                ...role.querySelectorAll(`
                .role-disallowed .property-reference,
                .role-disallowed .state-reference
              `),
              ].map((reference) => hash(reference.getAttribute("href")));

              // Grabbing the default value of attributes.
              const values = new Map(
                [
                  ...role.querySelectorAll(`
                .implicit-values .property-reference,
                .implicit-values .state-reference
              `),
                ].flatMap((reference) => {
                  const href = reference.getAttribute("href");
                  const key = hash(href);
                  const value = reference.parentElement.querySelector(
                    `[href="${href}"] + .default`
                  );

                  if (value === null) {
                    return [];
                  }

                  return [[key, value.textContent]];
                })
              );

              // Finally gathering all attributes, with the correct flags.
              const attributes = [
                ...new Set(
                  [
                    ...supported,
                    ...required,
                    ...prohibited,
                    ...values.keys(),
                  ].sort()
                ),
              ].map((attribute) => {
                return [
                  attribute,
                  {
                    required: required.includes(attribute),
                    prohibited: prohibited.includes(attribute),
                    value: values.get(attribute) ?? null,
                  },
                ];
              });

              // Can it be named from author or contents?
              const from =
                role
                  .querySelector(".role-namefrom")
                  ?.textContent.trim()
                  .split(/\s+/)
                  .filter((from) => from !== "n/a")
                  .sort() ?? [];

              // Is the name required or prohibited?
              const name = {
                required:
                  role.querySelector(".role-namerequired")?.textContent ===
                    "True" ?? false,

                prohibited: from.includes("prohibited"),

                from: from.filter((method) => method !== "prohibited"),
              };

              // What are the required context role?
              const parent = {
                required: [
                  ...role.querySelectorAll(".role-scope, .role-scope li"),
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

              // Are children presentational? What are the required owned elements?
              const children = {
                presentational:
                  role.querySelector(".role-childpresentational")
                    ?.textContent === "True" ?? false,

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
            .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
        );
      })
    );
  }

  browser.close();

  let code = `
// This file has been automatically generated based on the various WAI-ARIA
// specifications. Do therefore not modify it directly! If you wish to make
// changes, do so in \`scripts/roles.js\` and run \`yarn generate\` to rebuild this
// file.

/**
 * @internal
 */
export type Roles = typeof Roles;

/**
 * @internal
 */
export const Roles = ${JSON.stringify(roles, null, 2)} as const;
  `;

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "..", "src", "role", "data.ts"), code);
});
