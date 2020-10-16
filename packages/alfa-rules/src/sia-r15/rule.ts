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
import { URL } from "@siteimprove/alfa-url";
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
  evaluate({ device, document, response }) {
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
        const sources = List.from(target).map((iframe) =>
          embeddedResource(iframe, response.url)
        );
        console.log(sources);
        const source = commonValue(sources);

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
function embeddedResource(iframe: Element, base?: string | URL): string {
  return (
    iframe
      // srcdoc takes precedence.
      .attribute("srcdoc")
      .map((srcdoc) => "srcdoc: " + srcdoc.value)
      .getOrElse(() =>
        iframe
          // Otherwise, grab the src attribute.
          .attribute("src")
          .map((attribute) =>
            URL.parse(attribute.value, base)
              .map((url) => "src:" + url.toString())
              .getOr("invalid:")
          )
          .getOr("nothing:")
      )
  );
}

/**
 * If all items have the same value, return it; otherwise return None.
 */
function commonValue<T>(iterable: Iterable<T>): Option<T> {
  const firstItem = first(iterable);

  return firstItem.every((item) =>
    every(iterable, (value) => equals(value, item))
  )
    ? firstItem
    : None;
}
