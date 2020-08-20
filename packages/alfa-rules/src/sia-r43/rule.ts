import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasExplicitRole } from "../common/predicate/has-explicit-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r43.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.SVG),
                hasExplicitRole("img", "graphics-document", "graphics-symbol"),
                not(isIgnored(device))
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasNonEmptyAccessibleName(device)(target),
            () => Outcomes.HasName(target.name),
            () => Outcomes.HasNoName(target.name)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasName = (target: string) =>
    Ok.of(Diagnostic.of(`The \`<${target}>\` element has an accessible name`));

  export const HasNoName = (target: string) =>
    Err.of(
      Diagnostic.of(
        `The \`<${target}>\` element does not have an accessible name`
      )
    );
}
