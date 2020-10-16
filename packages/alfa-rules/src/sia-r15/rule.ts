import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { isElement, hasName, hasNamespace } = Element;
const { equals } = Equatable;
const { every, filter, first } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r15.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const iframes = document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasName("iframe"),
              hasNamespace(Namespace.HTML),
              not(isIgnored(device)),
              hasNonEmptyAccessibleName(device)
            )
          );

        const groups = iframes
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
          .values();
        return filter(groups, (group) => group.size > 1);
      },

      expectations(target) {
        const source = commonValue(List.from(target).map(embeddedResource));

        return {
          1: expectation(
            source.isSome() &&
              // always ask question if we can't find source, presumably the content doc is fed another way into the iframes
              source.get() !== "invalid:" &&
              source.get() !== "nothing:",
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

/**
 * @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#process-the-iframe-attributes
 */
function embeddedResource(iframe: Element): string {
  // srcdoc takes precedence.
  if (iframe.attribute("srcdoc").isSome()) {
    return "srcdoc:" + iframe.attribute("srcdoc").get().value;
  }

  // Otherwise, grab the src attribute.
  function getUrl(value: string): string {
    try {
      return "src:" + new URL(value).href;
    } catch {
      return "invalid:";
    }
  }

  return iframe
    .attribute("src")
    .map((attribute) => getUrl(attribute.value))
    .getOrElse(() => "nothing:");
}

function commonValue<T>(iterable: Iterable<T>): Option<T> {
  const firstItem = first(iterable);

  return firstItem.every((item) =>
    every(iterable, (value) => equals(value, item))
  )
    ? firstItem
    : None;
}
