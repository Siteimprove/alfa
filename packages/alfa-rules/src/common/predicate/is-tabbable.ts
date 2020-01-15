import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasTabIndex } from "./has-tab-index";
import { isDisabled } from "./is-disabled";
import { isInert } from "./is-inert";
import { isRendered } from "./is-rendered";

const { and, not } = Predicate;

/**
 * @see https://html.spec.whatwg.org/#sequential-focus-navigation
 */
export function isTabbable(device: Device): Predicate<Element> {
  return and(
    hasTabIndex(tabIndex => tabIndex >= 0),
    and(
      not(redirectsFocus),
      and(not(isDisabled), and(not(isInert(device)), isRendered(device)))
    )
  );
}

const redirectsFocus: Predicate<Element> = element => {
  if (element.namespace.includes(Namespace.HTML)) {
    switch (element.name) {
      // Per the sequential navigation search algorithm, browsing context
      // containers (<iframe> elements) redirect focus to either their first
      // focusable descendant or the next element in the sequential focus
      // navigation order.
      //
      // https://html.spec.whatwg.org/#browsing-context-container
      // https://html.spec.whatwg.org/#sequential-navigation-search-algorithm
      case "iframe":
        return true;

      // <label> elements redirect focus to their control.
      //
      // https://html.spec.whatwg.org/#the-label-element
      case "label":
        return true;
    }
  }

  return false;
};
