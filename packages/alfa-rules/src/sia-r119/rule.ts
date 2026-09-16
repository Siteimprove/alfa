import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import {
  Element,
  Namespace,
  Node,
  Query,
  Shadow,
  Text,
} from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Refinement } from "@siteimprove/alfa-refinement";
import type { Result } from "@siteimprove/alfa-result";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Sequence } from "@siteimprove/alfa-sequence";
import { String } from "@siteimprove/alfa-string";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.ts";
import { WithBadElements } from "../common/diagnostic/with-bad-elements.ts";

import { Scope, Stability } from "../tags/index.ts";

const { hasName, hasNamespace, isElement, isSlot } = Element;
const { and } = Refinement;
const { isRendered } = Style;
const { isText } = Text;
const { getElementDescendants } = Query;

/**
 * This rule checks that `<ul>`, `<ol>` and `<dl>` elements only contain the
 * children the HTML content model allows.
 *
 * Four readings of that content model are deliberate, and each one makes the
 * rule stricter than a relaxed reading would:
 *
 * - A `<dl>` wraps every name-value group in a `<div>` or wraps none of them.
 * - A `<div>` inside a `<dl>` holds exactly one group, so a second group packed
 *   into the same wrapper is reported.
 * - Every group must be well formed, not only the first, so a trailing `<dt>`
 *   with no `<dd>` is reported.
 * - Children are matched by element name, so a `<div role="listitem">` does not
 *   satisfy a content model asking for an `<li>`.
 *
 * {@link https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element}
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r119",
  requirements: [Criterion.of("1.3.1"), EAA.of("9.1.3.1")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            and(hasName("ul", "ol", "dl"), isRendered(device)),
          ),
        );
      },

      expectations(target) {
        return {
          1: expectation(
            hasTextContent(target),
            () => Outcomes.HasDisallowedText,
            () =>
              expectation(
                hasName("dl")(target),
                () => descriptionListContent(target),
                () => listContent(target),
              ),
          ),
        };
      },
    };
  },
});

function hasHtmlName<N extends string>(name: N, ...rest: Array<N>) {
  return and(hasNamespace(Namespace.HTML), hasName(name, ...rest));
}

const isScriptSupporting = hasHtmlName("script", "template");

// A <slot> only slots inside a shadow tree. Anywhere else no assignment
// algorithm reaches it, so it is an inert element in a position the content
// model forbids. The flat tree replaces it with nothing, which is why this is
// the one check that has to read the node tree.
function straySlots(element: Element): Sequence<Element> {
  return element
    .children()
    .filter(isElement)
    .filter(isSlot)
    .reject((slot) => Shadow.isShadow(slot.root()));
}

function elementChildren(element: Element): Sequence<Element> {
  return element
    .children(Node.fullTree)
    .filter(isElement)
    .reject(isScriptSupporting);
}

function hasTextContent(element: Element): boolean {
  return element
    .children(Node.fullTree)
    .filter(isText)
    .some((text) => !String.isWhitespace(text.data));
}

function listContent(target: Element): Result<Diagnostic> {
  const disallowed = elementChildren(target)
    .reject(hasHtmlName("li"))
    .concat(straySlots(target));

  return disallowed.isEmpty()
    ? Outcomes.HasValidContent
    : Outcomes.HasDisallowedElements(disallowed);
}

function descriptionListContent(target: Element): Result<Diagnostic> {
  const children = elementChildren(target);
  const disallowed = children
    .reject(hasHtmlName("div", "dt", "dd"))
    .concat(straySlots(target));

  if (!disallowed.isEmpty()) {
    return Outcomes.HasDisallowedElements(disallowed);
  }

  const wrappers = children.filter(hasName("div"));
  const items = children.filter(hasName("dt", "dd"));

  if (!wrappers.isEmpty()) {
    if (!items.isEmpty()) {
      return Outcomes.HasMixedGroups(items);
    }

    const malformed = wrappers.reject(isWellFormedGroup);

    return malformed.isEmpty()
      ? Outcomes.HasValidContent
      : Outcomes.HasMalformedGroups(malformed);
  }

  const ungrouped = ungroupedItems(items);

  return ungrouped.isEmpty()
    ? Outcomes.HasValidContent
    : Outcomes.HasMalformedGroups(ungrouped);
}

function isWellFormedGroup(wrapper: Element): boolean {
  if (hasTextContent(wrapper)) {
    return false;
  }

  const children = elementChildren(wrapper);

  if (
    !children.reject(hasHtmlName("dt", "dd")).isEmpty() ||
    !straySlots(wrapper).isEmpty()
  ) {
    return false;
  }

  const terms = children.takeWhile(hasName("dt"));
  const descriptions = children.skip(terms.size);

  return (
    !terms.isEmpty() &&
    !descriptions.isEmpty() &&
    descriptions.every(hasName("dd"))
  );
}

function ungroupedItems(items: Sequence<Element>): Sequence<Element> {
  const leadingDescriptions: Sequence<Element> = items.takeWhile(hasName("dd"));
  const trailingTerms = items.takeLastWhile(hasName("dt"));

  return leadingDescriptions.concat(trailingTerms);
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidContent = Ok.of(
    Diagnostic.of(
      `The element only contains the content allowed by its content model.`,
    ),
  );

  export const HasDisallowedText = Err.of(
    Diagnostic.of(
      `The element contains text that its content model does not allow.`,
    ),
  );

  export const HasDisallowedElements = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(
        `The element contains child elements that its content model does not allow.`,
        errors,
      ),
    );

  export const HasMixedGroups = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(
        `The <dl> element mixes name-value groups wrapped in a <div> with groups that are not wrapped.`,
        errors,
      ),
    );

  export const HasMalformedGroups = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(
        `The <dl> element contains a name-value group that is not one or more <dt> elements followed by one or more <dd> elements.`,
        errors,
      ),
    );
}
