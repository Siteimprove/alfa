import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Document, Element, h, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { isElement, hasName, hasNamespace } = Element;
const { filter, map } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r15.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const iframes = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasName("iframe"),
                hasNamespace(Namespace.HTML),
                not(isIgnored(device)),
                hasNonEmptyAccessibleName(device)
              )
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
        // @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#process-the-iframe-attributes
        const sources = Set.from(map(target, embeddedResource)).reduce(
          (sources, source) => {
            // for strings, we can rely on === and set building
            if (typeof source === "string") {
              return sources.add(source);
            }
            // for Documents, we need to compare the value with equals.
            if (sources.some(source.equals)) {
              return sources;
            } else {
              return sources.add(source);
            }
          },
          Set.empty<Document | string>()
        );

        return {
          1: expectation(
            sources.size === 1,
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
function embeddedResource(iframe: Element): Document | string {
  // If we have a content document, use it.
  // This should cover the case where there is an srcdoc attribute.
  if (iframe.content.isSome()) {
    return iframe.content.get();
  }

  // Otherwise, grab the src attribute.
  const src = iframe.attribute("src");
  const fallback = "about:blank";

  function getUrl(value: string): URL {
    try {
      return new URL(value);
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        return new URL(fallback);
      } else {
        throw error;
      }
    }
  }

  return src.map((attribute) => getUrl(attribute.value).href).getOr(fallback);
}
