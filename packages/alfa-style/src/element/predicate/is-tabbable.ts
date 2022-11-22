import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isInert } from "./is-inert";
import { isRendered } from "../../node/predicate/is-rendered";

const { hasName, hasNamespace, hasTabIndex, isActuallyDisabled } = Element;
const { and, not } = Predicate;

/**
 * {@link https://html.spec.whatwg.org/#sequential-focus-navigation}
 *
 * @public
 */
export function isTabbable(device: Device): Predicate<Element> {
  return and(
    hasTabIndex((tabIndex) => tabIndex >= 0),
    not(redirectsFocus),
    not(isActuallyDisabled),
    not(isInert(device)),
    isRendered(device)
  );
}

/**
 * Per the sequential navigation search algorithm, browsing context
 * containers (<iframe> elements) redirect focus to either their first
 * focusable descendant or the next element in the sequential focus
 * navigation order.
 * {@link https://html.spec.whatwg.org/#browsing-context-container}
 * {@link https://html.spec.whatwg.org/#sequential-navigation-search-algorithm}

 * <label> elements redirect focus to their control.
 * {@link https://html.spec.whatwg.org/#the-label-element}
 */
const redirectsFocus: Predicate<Element> = and(
  hasNamespace(Namespace.HTML),
  hasName("iframe", "label")
);
