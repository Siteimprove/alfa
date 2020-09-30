import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
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
        const sources = Set.from(map(target, embeddedResource));

        return {
          1: expectation(
            sources.size === 1 &&
              // always ask question if we can't find source, presumably the content doc is fed another way into the iframes
              sources.every((source) => source.value.isSome()),
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

type Source = "srcdoc" | "src" | "invalid" | "nothing";

class EmbeddedResource implements Equatable, Hashable {
  public static of(source: Source, value?: string): EmbeddedResource {
    return new EmbeddedResource(source, Option.from(value));
  }

  private readonly _source: Source;
  private readonly _value: Option<string>;

  private constructor(source: Source, value: Option<string>) {
    this._source = source;
    this._value = value;
  }

  public get value(): Option<string> {
    return this._value;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof EmbeddedResource &&
      this._source === value._source &&
      this._value.equals(value._value)
    );
  }

  public hash(hash: Hash) {
    Hash.writeString(hash, this._source);
    this._value.hash(hash);
  }

  public toString() {
    return `{source: ${this._source}, value: ${this._value}}`;
  }
}

/**
 * @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#process-the-iframe-attributes
 */
function embeddedResource(iframe: Element): EmbeddedResource {
  // srcdoc takes precedence.
  if (iframe.attribute("srcdoc").isSome()) {
    return EmbeddedResource.of(
      "srcdoc",
      iframe.attribute("srcdoc").get().value
    );
  }

  // Otherwise, grab the src attribute.
  function getUrl(value: string): EmbeddedResource {
    try {
      return EmbeddedResource.of("src", new URL(value).href);
    } catch (error: unknown) {
      if (error instanceof TypeError) {
        return EmbeddedResource.of("invalid");
      } else {
        throw error;
      }
    }
  }

  return iframe
    .attribute("src")
    .map((attribute) => getUrl(attribute.value))
    .getOrElse(() => EmbeddedResource.of("nothing"));
}
