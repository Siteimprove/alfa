const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const statements = await page.evaluate(() => {
    const list = [
      ...document.getElementById("mw-content-text").querySelectorAll("h3, pre"),
    ];

    const statements = [];

    for (let i = 0; i < list.length; i += 2) {
      const heading = list[i];
      const pre = list[i + 1];

      const title = heading.innerText;
      const kind = title.includes("Name") ? "name" : "description";
      const testId = heading.querySelector("span").getAttribute("id");

      const statement = pre.innerText;
      const [_, code, targetId, result] = statement.match(
        // if given [code] then the accessible [name|description] of the element
        // with id of "[targetId]" is "[result]"
        /if given\n([^]*)\nthen the accessible.*"(.*)".*"(.*)"/m
      );

      statements.push({ title, kind, testId, code, targetId, result });
    }

    return statements;
  });

  browser.close();

  let code = warning + imports + statements.map(printNameTestCase).join("\n");

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(
    path.join(__dirname, "..", "test", "name-testable-statements.spec.tsx"),
    code
  );
}

function printNameTestCase({ title, kind, testId, code, targetId, result }) {
  return kind !== "name"
    ? ""
    : `/**
 * {@link ${url}#${testId}}
 */
test("${title}", (t) => {
  const testCase = (
    <div>
      ${fixCodeException(testId, fixcode(code))}
    </div>
  );

  const document = h.document([testCase]);

  const target = document
    .descendants()
    .find(and(isElement, hasId("${targetId}")))
    .get();

  t.equal(Name.from(target, device).get().value, "${result}");
});
`;
}
// Some input are written as <input …> with no (self-)closing tag,
// turning them into self-closing tags.
function fixMissingClosingTag(code) {
  return code.replace(/<input ([^/>]*[^/])>/gm, "<input $1/>");
}

// <style> elements works poorly in JSX, turning them into JS strings.
function fixStyleElement(code) {
  return code.replace(
    /<style([^>]*)>([^]*)<[/]style>/gm,
    "<style$1>{`$2`}</style>"
  );
}

// style attribute does not accept string in JSX, turning them into objects.
function styleStringToStyleObjectString(str) {
  return `{{ ${str
    // find all declaration (';' separated blocks)
    .replace(/([^;]*)/gm, (_, declaration) =>
      declaration.replace(
        // break declaration in "name: value" format
        /(.*):(.*)/gm,
        (_, property, value) =>
          `${property
            .trim()
            // turn the kebab-case property name into a camelCase one by
            // replacing "-x" match to "X"
            .replace(/-(.)/gm, (_, p1) => p1.toUpperCase())}: "${value.trim()}"`
      )
    )
    .replace(/;/g, ", ")} }}`;
}

function fixStyleAttribute(code) {
  return code.replace(
    /style="([^"]*)"/gm,
    (_, style) => `style=${styleStringToStyleObjectString(style)}`
  );
}

function fixcode(code) {
  return fixStyleAttribute(fixStyleElement(fixMissingClosingTag(code)));
}

// Some test cases just have broken code :-/
function fixCodeException(id, code) {
  switch (id) {
    case "Name_test_case_610":
      return code.replace(/<[/]label>/m, "</div>");
    case "Name_test_case_613":
      return code.replace(/<[/]body>/m, "");
    case "Name_file-label-inline-block-elements":
      // Not technically a problem, but still make JSX unhappy
      return code.replace(/<br>/m, "<br />");
    default:
      return code;
  }
}

const url = "https://www.w3.org/wiki/AccName_1.1_Testable_Statements";

const warning = `// This file has been automatically generated based on the Accessible Name Testable statements.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/name-testable-statement.js\` and run \`yarn generate\` to rebuild this file.

`;

const imports = `import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Name } from "../src";

const { and } = Refinement;
const { hasId, isElement } = Element;

const device = Device.standard();

`;

main();
