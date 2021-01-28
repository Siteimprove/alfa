import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { isIgnored } from "../common/predicate/is-ignored";
import { referenceSameResource } from "../common/predicate/reference-same-resource";

import { Question } from "../common/question";
import { Group } from "../common/group";

const { isElement, hasName, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Group<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r15.html",
  requirements: [Criterion.of("4.1.2")],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasName("iframe"),
              hasNamespace(Namespace.HTML),
              not(isIgnored(device)),
              hasNonEmptyAccessibleName(device)
            )
          )
          .reduce((groups, iframe) => {
            for (const [node] of Node.from(iframe, device)) {
              const name = node.name.map((name) => name.value);

              groups = groups.set(
                name,
                groups
                  .get(name)
                  .getOrElse(() => List.empty<Element>())
                  .append(iframe)
              );
            }

            return groups;
          }, Map.empty<Option<string>, List<Element>>())
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
            () => Outcomes.EmbedSameResources,
            () =>
              Question.of(
                "reference-equivalent-resources",
                "boolean",
                target,
                "Do the <iframe> elements embed equivalent resources?"
              ).map((embedEquivalentResources) =>
                expectation(
                  embedEquivalentResources,
                  () => Outcomes.EmbedEquivalentResources,
                  () => Outcomes.EmbedDifferentResources
                )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const EmbedSameResources = Ok.of(
    Diagnostic.of(`The \`<iframe>\` elements embed the same resource`)
  );

  export const EmbedEquivalentResources = Ok.of(
    Diagnostic.of(`The \`<iframe>\` elements embed equivalent resources`)
  );

  export const EmbedDifferentResources = Err.of(
    Diagnostic.of(
      `The \`<iframe>\` elements do not embed the same or equivalent resources`
    )
  );
}
