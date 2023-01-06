const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const puppeteer = require("puppeteer");

function testExceptions(testId) {
  switch (testId) {
    case "Name_test_case_547":
    case "Name_test_case_549":
    case "Name_test_case_550":
    case "Name_test_case_562":
    case "Name_test_case_563":
    case "Name_test_case_564":
    case "Name_test_case_565":
    case "Name_test_case_566":
    case "Name_test_case_617":
    case "Name_test_case_618":
    case "Name_test_case_619":
    case "Name_test_case_620":
    case "Name_test_case_621":
    case "Name_test_case_727":
    case "Name_test_case_728":
    case "Name_test_case_729":
    case "Name_test_case_730":
    case "Name_test_case_731":
    case "Name_test_case_738":
    case "Name_test_case_739":
    case "Name_test_case_740":
    case "Name_test_case_741":
    case "Name_test_case_742":
    case "Name_test_case_743":
    case "Name_test_case_744":
    case "Name_test_case_745":
    case "Name_test_case_746":
    case "Name_test_case_747":
    case "Name_checkbox-label-embedded-combobox":
    case "Name_checkbox-label-embedded-menu":
    case "Name_checkbox-label-embedded-select":
    case "Name_checkbox-label-embedded-slider":
    case "Name_checkbox-label-embedded-spinbutton":
    case "Name_file-label-embedded-combobox":
    case "Name_file-label-embedded-menu":
    case "Name_file-label-embedded-select":
    case "Name_file-label-embedded-slider":
    case "Name_file-label-embedded-spinbutton":
    case "Name_password-label-embedded-combobox":
    case "Name_password-label-embedded-menu":
    case "Name_password-label-embedded-select":
    case "Name_password-label-embedded-slider":
    case "Name_password-label-embedded-spinbutton":
    case "Name_radio-label-embedded-combobox":
    case "Name_radio-label-embedded-menu":
    case "Name_radio-label-embedded-select":
    case "Name_radio-label-embedded-slider":
    case "Name_radio-label-embedded-spinbutton":
    case "Name_text-label-embedded-combobox":
    case "Name_text-label-embedded-menu":
    case "Name_text-label-embedded-select":
    case "Name_text-label-embedded-slider":
    case "Name_text-label-embedded-spinbutton":
    case "Name_checkbox-label-embedded-listbox":
    case "Name_file-label-owned-combobox-owned-listbox":
    case "Name_file-label-owned-combobox":
    case "Name_heading-combobox-focusable-alternative":
      return {
        reason:
          "Alfa does not implement step 2C of Accessible name computation (form embedded in label)",
        issue: "https://github.com/Siteimprove/alfa/issues/305",
      };
    case "Name_test_case_548":
    case "Name_test_case_733":
    case "Name_test_case_734":
    case "Name_test_case_735":
    case "Name_test_case_736":
    case "Name_test_case_737":
      return {
        reason:
          "Alfa incorrectly recurses into <select> when computing name from content",
        issue: "https://github.com/Siteimprove/alfa/issues/1192",
      };
    case "Name_test_case_552":
    case "Name_test_case_553":
    case "Name_test_case_659":
    case "Name_test_case_660":
    case "Name_test_case_661":
    case "Name_test_case_662":
    case "Name_test_case_663a":
    case "Name_test_case_753":
    case "Name_test_case_754":
    case "Name_test_case_755":
    case "Name_test_case_756":
    case "Name_test_case_757":
    case "Name_test_case_758":
    case "Name_test_case_759":
    case "Name_test_case_760":
    case "Name_test_case_761":
    case "Name_test_case_762":
    case "Name_file-label-inline-block-styles":
      return {
        reason: "Alfa does not support :before and :after pseudo-elements",
        issue: "https://github.com/Siteimprove/alfa/issues/954",
      };
    case "Name_from_content":
    case "Name_from_content_of_labelledby_element":
    case "Name_from_content_of_label":
    case "Name_file-label-inline-block-elements":
    case "Name_file-label-inline-hidden-elements":
    case "Name_link-mixed-content":
      return {
        reason: "Alfa joins content traversal without spaces",
        issue: "https://github.com/Siteimprove/alfa/issues/1203",
      };
    case "Name_test_case_596":
    case "Name_test_case_597":
    case "Name_test_case_598":
    case "Name_test_case_599":
      return {
        reason: "ARIA 1.2 maps div to generic, which prohibits name",
        issue: "https://github.com/w3c/accname/issues/180",
      };
    default:
      return undefined;
  }
}

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

      statements.push({
        title,
        kind,
        testId,
        code,
        targetId,
        result,
      });
    }

    return statements;
  });

  browser.close();

  let code =
    warning +
    imports +
    statements
      .filter(
        ({ testId }) =>
          testId !== "Name_test_case_663_.28DO_NOT_USE.29" &&
          testId !==
            "Description_from_content_of_describedby_element_which_is_hidden_.28DO_NOT_USE.29"
      )
      .map(printNameTestCase)
      .join("\n");

  code = prettier.format(code, {
    parser: "typescript",
  });

  fs.writeFileSync(
    path.join(__dirname, "..", "test", "name-testable-statements.spec.tsx"),
    code
  );
}

function printNameTestCase({ title, kind, testId, code, targetId, result }) {
  const exception = testExceptions(testId);

  // <style> elements are poorly handled by our JSX :-/
  // This discard the type="text/css" bit of them, which is OK.
  // <style …>[style]</style>[jsxCode]
  const match = code.match(/<style[^>]*>([^]*)<[/]style>([^]*)/m);
  let jsxCode = code;
  let style = "";

  if (match !== null) {
    [, style, jsxCode] = match;

    style = `, [h.sheet([${styleElementToStyleSheet(style)}])]`;
  }

  return kind !== "name"
    ? ""
    : `/**
 * {@link ${url}#${testId}} ${
        exception === undefined
          ? ""
          : `
 *
 * ${exception.reason}
 * {@link ${exception.issue}}`
      }
 */
test("${title}", (t) => {
  const testCase = (
    <div>
      ${fixCodeException(testId, fixcode(jsxCode))}
    </div>
  );

  const document = h.document([testCase]${style});

  const target = getTarget(document, "${targetId}");

  t.${
    exception === undefined ? "equal" : "notEqual"
  }(getName(target), "${result}");
});
`;
}
// Some input elements are written as <input …> with no (self-)closing tag,
// turning them into self-closing tags.
function fixMissingClosingTag(code) {
  // <input [content]> => <input [content]/>
  return code.replace(/<input ([^/>]*[^/])>/gm, "<input $1/>");
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
  // style="[style in kebab-case]" => style={{[style im camelCase]}}
  return code.replace(
    /style="([^"]*)"/gm,
    (_, style) => `style=${styleStringToStyleObjectString(style)}`
  );
}

function fixcode(code) {
  return fixStyleAttribute(fixMissingClosingTag(code));
}

// Some test cases just have broken code :-/
function fixCodeException(id, code) {
  switch (id) {
    case "Name_test_case_610":
      return code.replace(/<[/]label>/m, "</div>");
    case "Name_test_case_613":
      return code.replace(/<[/]body>/m, "");
    case "Name_file-label-inline-block-elements":
      // Not technically a problem, but still makes JSX unhappy
      return code.replace(/<br>/m, "<br />");
    default:
      return code;
  }
}

// Our JSX doesn't really handle <style> elements. Turning them into an Alfa
// style sheet :-/
// Fortunately the <style> elements are not too complex
// This is still bad…
function styleElementToStyleSheet(style) {
  return style.replace(
    // [selector] {[declaration]}
    // (actually, there can be several declarations…)
    /([^{]*){([^}]*)}/gm,
    (_, selector, declaration) =>
      `h.rule.style("${selector.trim()}", [${declaration.trim().replace(
        // [property]: [value];
        // value may be doubled quoted or not.
        // Each declaration is mapped into a Declaration.of and they are
        // then joined as an array (enclosing []).
        /([^:]*):[ "]*([^ ";]*)[ ";]*/g,
        `Declaration.of("$1", "$2"),`
      )}]),`
  );
}

const url = "https://www.w3.org/wiki/AccName_1.1_Testable_Statements";

const warning = `// This file has been automatically generated based on the Accessible Name Testable statements.
// Do therefore not modify it directly! If you wish to make changes, do so in
// \`scripts/name-testable-statement.js\` and run \`yarn generate\` to rebuild this file.

`;

const imports = `import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Declaration, Document, Element, h } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Name } from "../src";

const { and } = Refinement;
const { hasId, isElement } = Element;

const device = Device.standard();

function getTarget(document: Document, id: string): Element {
  return document
    .descendants()
    .find(and(isElement, hasId(id)))
    .getUnsafe()
}

function getName(element: Element): string {
  return Name.from(element, device)
    .map((name) => name.value)
    .getOr("");
}

`;

main();
