import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasExplicitRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
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
            hasAccessibleName(device, not(isEmpty))(target),
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
