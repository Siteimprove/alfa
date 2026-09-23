import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.ts";
import { BestPractice } from "../requirements/index.ts";

import { Scope, Stability } from "../tags/index.ts";

const { hasNamespace } = Element;
const { and } = Predicate;
const { isRendered } = Style;
const { getElementDescendants } = Query;

/**
 * This rule checks that the access keys an element declares are usable: that no
 * other element declares the same key, that each key is a single character, and
 * that the element does not declare the same key twice.
 *
 * Two elements competing for one key means at most one of them can be reached
 * by it, and which one wins is left to the user agent.
 *
 * Case is folded throughout, since `A` and `a` reach the same physical key, so
 * `accesskey="a A"` declares one key twice and is reported for the repeat. That
 * is stricter than the specification, which asks only that the tokens not be
 * "identical to another token", a literal comparison the W3C checker
 * implements with a case-sensitive equality.
 *
 * Elements that are not rendered are left out, since their access keys cannot
 * be activated, and a key declared only on such an element competes with
 * nothing.
 *
 * {@link https://html.spec.whatwg.org/multipage/interaction.html#the-accesskey-attribute}
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r120",
  requirements: [BestPractice.of("accesskey-unique")],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ device, document }) {
    const elements = getElementDescendants(document, Node.fullTree)
      .filter(and(hasNamespace(Namespace.HTML), declaresAccesskey))
      .filter(isRendered(device));

    const accessKeyElementPairs = new Map<string, Array<Element>>();

    for (const element of elements) {
      for (const key of accesskeys(element)) {
        const elementsForKey = accessKeyElementPairs.get(key) ?? [];

        elementsForKey.push(element);
        accessKeyElementPairs.set(key, elementsForKey);
      }
    }

    return {
      applicability() {
        return elements;
      },

      expectations(target) {
        const contested = accesskeys(target).filter(
          (key) => (accessKeyElementPairs.get(key)?.length ?? 0) > 1,
        );
        const tooLong = tokens(target).reject((token) => token.length === 1);

        const duplicated = repeatedTokens(target);

        return {
          1: expectation(
            contested.isEmpty(),
            () => Outcomes.HasUniqueAccesskeys,
            () => Outcomes.HasNonUniqueAccesskeys(contested),
          ),
          2: expectation(
            tooLong.isEmpty(),
            () => Outcomes.HasSingleCharacterAccesskeys,
            () => Outcomes.HasMultiCharacterAccesskeys(tooLong),
          ),
          3: expectation(
            duplicated.isEmpty(),
            () => Outcomes.HasDistinctAccesskeys,
            () => Outcomes.HasRepeatedAccesskeys(duplicated),
          ),
        };
      },
    };
  },
});

function tokens(element: Element): Sequence<string> {
  return Sequence.from(element.attribute("accesskey")).flatMap((attribute) =>
    attribute.tokens(),
  );
}

function accesskeys(element: Element): Sequence<string> {
  return tokens(element)
    .map((token) => token.toLowerCase())
    .distinct();
}

function repeatedTokens(element: Element): Sequence<string> {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (const token of tokens(element).map((token) => token.toLowerCase())) {
    if (seen.has(token)) {
      repeated.add(token);
    } else {
      seen.add(token);
    }
  }

  return Sequence.from(repeated);
}

const declaresAccesskey: Predicate<Element> = (element) =>
  !tokens(element).isEmpty();

/**
 * @public
 */
export namespace Outcomes {
  export const HasUniqueAccesskeys = Ok.of(
    Diagnostic.of(
      `No access key of the element is declared by another element.`,
    ),
  );

  export const HasNonUniqueAccesskeys = (keys: Iterable<string>) =>
    Err.of(
      Diagnostic.of(
        many(keys)
          ? `More than one element declares the access keys ${list(keys)}.`
          : `More than one element declares the access key ${list(keys)}.`,
      ),
    );

  export const HasSingleCharacterAccesskeys = Ok.of(
    Diagnostic.of(`Every access key of the element is a single character.`),
  );

  export const HasMultiCharacterAccesskeys = (keys: Iterable<string>) =>
    Err.of(
      Diagnostic.of(
        many(keys)
          ? `The access keys ${list(keys)} are not single characters.`
          : `The access key ${list(keys)} is not a single character.`,
      ),
    );

  export const HasDistinctAccesskeys = Ok.of(
    Diagnostic.of(`The element declares each of its access keys once.`),
  );

  export const HasRepeatedAccesskeys = (keys: Iterable<string>) =>
    Err.of(
      Diagnostic.of(
        many(keys)
          ? `The element declares the access keys ${list(keys)} more than once.`
          : `The element declares the access key ${list(keys)} more than once.`,
      ),
    );
}

function list(keys: Iterable<string>): string {
  return Sequence.from(keys)
    .map((key) => `"${key}"`)
    .join(", ");
}

function many(keys: Iterable<string>): boolean {
  return Sequence.from(keys).size > 1;
}
