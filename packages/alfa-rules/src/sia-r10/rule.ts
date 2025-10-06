import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query, Attribute } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole, isPerceivableForAll } = DOM;
const { hasAttribute, hasInputType, hasName, hasNamespace } = Element;
const { and, or, not } = Predicate;
const { isTabbable } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r10",
  requirements: [Criterion.of("1.3.5"), EAA.of("9.1.3.5")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          getElementDescendants(document, dom.Node.fullTree)
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("input", "select", "textarea"),
                not(hasInputType("hidden", "button", "submit", "reset")),
                hasAttribute("autocomplete", hasTokens),
                hasAttribute(
                  "autocomplete",
                  (autocomplete) =>
                    String.normalize(autocomplete) !== "on" &&
                    String.normalize(autocomplete) !== "off",
                ),
                or(
                  isTabbable(device),
                  hasRole(device, (role) => role.isWidget()),
                ),
                isPerceivableForAll(device),
                (element) =>
                  Node.from(element, device)
                    .attribute("aria-disabled")
                    .none((disabled) => disabled.value === "true"),
              ),
            )
            // The big second filter ensure that autocomplete exists
            .map((element) => element.attribute("autocomplete").getUnsafe())
        );
      },

      expectations(target) {
        return {
          1: expectation(
            Attribute.Autocomplete.isValid(target.value),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue,
          ),
        };
      },
    };
  },
});

function hasTokens(input: string): boolean {
  return input.trim() !== "" && Attribute.Autocomplete.tokenize(input).length > 0;
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The \`autocomplete\` attribute has a valid value`),
  );
  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The \`autocomplete\` attribute does not have a valid value`),
  );
}
