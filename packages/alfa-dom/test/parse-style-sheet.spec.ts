import { test } from "@siteimprove/alfa-test";
import { RuleType, StyleRule } from "../src/types";
import { parseStyleSheet } from "../src/parse-style-sheet";

test("Can parse CSS to a style sheet", t => {
  const styleSheet = parseStyleSheet(`
    div {
      color: red;
    }
  `);

  t.deepEqual(styleSheet, {
    cssRules: [
      {
        type: RuleType.Style,
        selectorText: "div",
        style: {
          cssText: "color: red;"
        }
      } as StyleRule
    ]
  });
});
