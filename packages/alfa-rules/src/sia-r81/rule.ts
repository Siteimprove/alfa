import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/expectation";

import {
  hasNonEmptyAccessibleName,
  hasRole,
  isIgnored,
  referenceSameResource,
} from "../common/predicate";

import { Group } from "../common/group";
import { normalize } from "../common/normalize";
import { Question } from "../common/question";

const { isElement, hasName, hasNamespace, hasId } = Element;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Group<Element>, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r81",
  requirements: [Criterion.of("2.4.4"), Criterion.of("2.4.9")],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(device, (role) => role.is("link")),
              not(isIgnored(device)),
              hasNonEmptyAccessibleName(device)
            )
          )
          .groupBy((element) =>
            linkContext(element, device).add(element.root())
          )
          .flatMap((elements) =>
            elements.groupBy((element) =>
              Node.from(element, device).name.map((name) =>
                normalize(name.value)
              )
            )
          )
          .filter((elements) => elements.size > 1)
          .map(Group.of)
          .values();
      },

      expectations(target) {
        const embedSameResource = [...target].every(
          (element, i, elements) =>
            // This is either the first element...
            i === 0 ||
            // ...or an element that embeds the same resource as the element
            // before it.
            referenceSameResource(response.url)(element, elements[i - 1])
        );

        return {
          1: expectation(
            embedSameResource,
            () => Outcomes.ResolveSameResource,
            () =>
              Question.of(
                "reference-equivalent-resources",
                "boolean",
                target,
                `Do the links resolve to equivalent resources?`
              ).map((embedEquivalentResources) =>
                expectation(
                  embedEquivalentResources,
                  () => Outcomes.ResolveEquivalentResource,
                  () => Outcomes.ResolveDifferentResource
                )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const ResolveSameResource = Ok.of(
    Diagnostic.of(`The links resolve to the same resource`)
  );

  export const ResolveEquivalentResource = Ok.of(
    Diagnostic.of(`The links resolve to equivalent resources`)
  );

  export const ResolveDifferentResource = Err.of(
    Diagnostic.of(
      `The links do not resolve to the same or equivalent resources`
    )
  );
}

/**
 * @todo For links in table cells, account for the text in the associated table
 *       header cell.
 *
 * {@link https://www.w3.org/TR/WCAG/#dfn-programmatically-determined-link-context}
 */
function linkContext(element: Element, device: Device): Set<dom.Node> {
  let context = Set.empty<dom.Node>();

  const ancestors = element.ancestors({ flattened: true }).filter(isElement);

  for (const listitem of ancestors.filter(hasRole(device, "listitem"))) {
    context = context.add(listitem);
  }

  for (const paragraph of ancestors.find(hasName("p"))) {
    context = context.add(paragraph);
  }

  for (const cell of ancestors.find(hasRole(device, "cell", "gridcell"))) {
    context = context.add(cell);
  }

  for (const describedby of element.attribute("aria-describedby")) {
    for (const reference of element
      .root()
      .descendants()
      .filter(isElement)
      .filter(hasId(equals(...describedby.tokens())))) {
      context = context.add(reference);
    }
  }

  return context;
}
