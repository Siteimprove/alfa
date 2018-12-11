import { AssertionError, expect } from "@siteimprove/alfa-assert";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Rules } from "@siteimprove/alfa-wcag";
import { Rule } from "eslint";
import * as estree from "estree"; // tslint:disable-line
import { fromJsxElement, getNode } from "./from-jsx-element";
import { JSXElement } from "./types";

// tslint:disable:no-any

const keys: Array<keyof typeof Rules> = [
  "SIA_R4",
  "SIA_R5",
  "SIA_R6",
  "SIA_R7",
  "SIA_R9",
  "SIA_R10",
  "SIA_R16",
  "SIA_R18",
  "SIA_R19",
  "SIA_R20",
  "SIA_R21"
];

export const rules: { [rule: string]: Rule.RuleModule } = {};

for (const key of keys) {
  const rule = Rules[key];

  rules[key.toLowerCase().replace("_", "-")] = {
    create: context => {
      return {
        JSXElement(node: unknown) {
          const element = fromJsxElement(node as JSXElement);

          if (element !== null) {
            try {
              expect(element).to.pass(rule as any);
            } catch (err) {
              if (err instanceof AssertionError) {
                const node = getNode(err.target as Element | Attribute);

                if (node !== null) {
                  context.report({
                    node: (node as unknown) as estree.Node,
                    message: err.message
                  });
                }
              }
            }
          }
        }
      };
    }
  };
}
