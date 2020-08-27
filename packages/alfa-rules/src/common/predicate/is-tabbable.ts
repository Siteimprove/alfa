import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isInert } from "./is-inert";
import { isRendered } from "./is-rendered";

const { hasName, hasNamespace, hasTabIndex, isDisabled } = Element;
const { and, not } = Predicate;

/**
 * @see https://html.spec.whatwg.org/#sequential-focus-navigation
 */
export function isTabbable(device: Device): Predicate<Element> {
  return and(
    hasTabIndex((tabIndex) => tabIndex >= 0),
    and(
      not(redirectsFocus),
      and(not(isDisabled), not(isInert(device)), isRendered(device))
    )
  );
}

/**
 * Per the sequential navigation search algorithm, browsing context
 * containers (<iframe> elements) redirect focus to either their first
 * focusable descendant or the next element in the sequential focus
 * navigation order.
 * @see https://html.spec.whatwg.org/#browsing-context-container
 * @see https://html.spec.whatwg.org/#sequential-navigation-search-algorithm

 * <label> elements redirect focus to their control.
 * @see https://html.spec.whatwg.org/#the-label-element
 */
const redirectsFocus: Predicate<Element> = and(
  hasNamespace(Namespace.HTML),
  hasName("iframe", "label")
);
