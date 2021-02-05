import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import {
  Attribute,
  Element,
  Namespace,
  Text,
  Node,
} from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isIgnored } from "../common/predicate";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasName, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { not, or } = Predicate;
const { and, test } = Refinement;
const { isText } = Text;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r7.html",
  requirements: [Criterion.of("3.1.2"), Technique.of("H58")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(
          document
            .descendants()
            .find(isElement)
            .filter(and(hasNamespace(Namespace.HTML), hasName("body")))
            .get(),
          None
        );

        function* visit(
          node: Node,
          lang: Option<Attribute>
        ): Iterable<Attribute> {
          if (test(and(isElement, hasAttribute("lang", not(isEmpty))), node)) {
            lang = node.attribute("lang");
          }

          if (
            test(
              and(isText, or(isVisible(device), not(isIgnored(device)))),
              node
            ) &&
            lang !== None
          ) {
            yield lang.get();
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, lang);
          }
        }
      },

      expectations(target) {
        return {
          1: expectation(
            Language.parse(target.value).isSome(),
            () => Outcomes.HasValidLanguage,
            () => Outcomes.HasNoValidLanguage
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasValidLanguage = Ok.of(
    Diagnostic.of(`The \`lang\` attribute has a valid primary language subtag`)
  );

  export const HasNoValidLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute does not have a valid primary language subtag`
    )
  );
}
