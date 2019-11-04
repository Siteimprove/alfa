import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getParentRule } from "../src/get-parent-rule";
import {
  Document,
  MediaRule,
  NodeType,
  Rule,
  StyleDeclaration,
  StyleRule,
  StyleSheet
} from "../src/types";

test("Returns parent rule", t => {
  const childRule: StyleRule = {
    type: 1,
    selectorText: "button",
    style: {
      cssText: "background-color:black;"
    }
  };

  const parentRule: MediaRule = {
    type: 4,
    cssRules: [childRule],
    conditionText: "@media foo"
  };

  const styleSheet: StyleSheet = { cssRules: [parentRule], disabled: false };

  const document: Document = {
    nodeType: NodeType.Document,
    childNodes: [<div />],
    styleSheets: [styleSheet]
  };

  t.deepEqual(getParentRule(childRule, document), Some.of(parentRule as Rule));
});

test("Returns null when context is not document type", t => {
  const div = <div />;
  const rule: Rule = { type: 1 };
  t.equal(getParentRule(rule, div), None);
});

test("Returns null when parent rule does not exist", t => {
  const childStyleDec: StyleDeclaration = {
    cssText: "background-color:black;"
  };

  const childRule: StyleRule = {
    type: 1,
    selectorText: "button",
    style: childStyleDec
  };

  const styleSheet: StyleSheet = { cssRules: [], disabled: false };

  const document: Document = {
    nodeType: NodeType.Document,
    childNodes: [<div />],
    styleSheets: [styleSheet]
  };

  t.equal(getParentRule(childRule, document), None);
});
