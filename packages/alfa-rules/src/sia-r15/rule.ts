import { Rule } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { filter, map, flatMap, reduce, groupBy, isEmpty } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r15.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const iframes = filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasName(equals("iframe")),
              and(
                hasNamespace(equals(Namespace.HTML)),
                and(
                  not(isIgnored(device)),
                  hasAccessibleName(device, not(isEmpty))
                )
              )
            )
          )
        );

        const roots = groupBy(iframes, iframe => iframe.root());

        return flatMap(roots, ([root, iframes]) =>
          reduce(
            iframes,
            (groups, iframe) => {
              for (const [node] of Node.from(iframe, device)) {
                groups = groups.set(
                  node.name(),
                  groups
                    .get(node.name())
                    .getOrElse(() => List.empty<Element>())
                    .push(iframe)
                );
              }

              return groups;
            },
            Map.empty<Option<string>, List<Element>>()
          ).values()
        );
      },

      expectations(target) {
        const sources = Set.from(
          map(target, iframe => iframe.attribute("src"))
        );

        return {
          1:
            sources.length === 1
              ? Ok.of("The <iframe> elements embed the same resource")
              : Question.of(
                  "reference-equivalent-resources",
                  "boolean",
                  target,
                  "Do the <iframe> elements embed equivalent resources?"
                ).map(embedEquivalentResources =>
                  embedEquivalentResources
                    ? Ok.of("The <iframe> elements embed equivalent resources")
                    : Err.of(
                        "The <iframe> elements do not embed the same or equivalent resources"
                      )
                )
        };
      }
    };
  }
});
