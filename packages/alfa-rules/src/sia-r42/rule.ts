import { Rule } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { hasNamespace } from "../common/predicate/has-namespace";
import { hasNondefaultRole } from "../common/predicate/has-nondefault-role";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";
import { Ok, Err } from "@siteimprove/alfa-result";

const { filter } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r42.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
              and(
                not(isIgnored(device)),
                and(
                  hasNondefaultRole,
                  hasRole(role => role.hasContext())
                )
              )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: test(hasRequiredContext(device), target)
            ? Ok.of(
                "The element is owned by an element of its required context role"
              )
            : Err.of(
                "The element is not owned by an element of its required context role"
              )
        };
      }
    };
  }
});

function hasRequiredContext(device: Device): Predicate<Element> {
  return element =>
    Node.from(element, device).every(node =>
      node.parent().some(parent =>
        parent.role().some(role =>
          node
            .role()
            .get()
            .hasContext(context => context.name === role.name)
        )
      )
    );
}
