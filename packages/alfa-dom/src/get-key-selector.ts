import {
  Selector,
  IdSelector,
  ClassSelector,
  TypeSelector
} from "@siteimprove/alfa-css";

/**
 * Given a selector, get the right-most ID, class, or type selector, i.e. the
 * key selector.
 *
 * @internal
 */
export function getKeySelector(
  selector: Selector
): IdSelector | ClassSelector | TypeSelector | null {
  switch (selector.type) {
    case "id-selector":
    case "class-selector":
      return selector;

    case "type-selector":
      return selector.name === "*" ? null : selector;

    case "relative-selector":
      return getKeySelector(selector.selector);

    case "compound-selector":
      const { selectors } = selector;

      for (let i = selectors.length - 1; i > 0; i--) {
        const selector = getKeySelector(selectors[i]);

        if (selector !== null) {
          return selector;
        }
      }
  }

  return null;
}
