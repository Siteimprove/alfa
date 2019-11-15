import { Rule } from "@siteimprove/alfa-act";
import { getAccessibleName } from "@siteimprove/alfa-aria";
import {
  Element,
  getAttribute,
  getRootNode,
  isElement,
  Namespace
} from "@siteimprove/alfa-dom";
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
import { isEmpty } from "../common/predicate/is-empty";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";
import { walk } from "../common/walk";

const { filter, map, flatMap, groupBy, reduce } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "sanshikan:rules/sia-r15.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const iframes = filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasName(equals("iframe")),
              and(
                hasNamespace(document, equals(Namespace.HTML)),
                and(
                  not(isIgnored(document, device)),
                  hasAccessibleName(document, device, not(isEmpty))
                )
              )
            )
          )
        );

        const roots = groupBy(iframes, iframe => getRootNode(iframe, document));

        return flatMap(roots, ([root, iframes]) =>
          reduce(
            iframes,
            (groups, iframe) => {
              for (const [name] of getAccessibleName(
                iframe,
                document,
                device
              )) {
                groups = groups.set(
                  name,
                  groups
                    .get(name)
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
          map(target, iframe => getAttribute(iframe, document, "src"))
        );

        return {
          1:
            sources.size === 1
              ? Ok.of("The <iframe> elements embed the same resource")
              : Question.of(
                  "embed-equivalent-resources",
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
