import {
  ClassSelector,
  IdSelector,
  Selector,
  SelectorType,
  TypeSelector
} from "@siteimprove/alfa-css";

/**
 * Given a selector, get the right-most ID, class, or type selector, i.e. the
 * key selector. If the right-most selector is a compound selector, then the
 * left-most ID, class, or type selector of the compound selector is returned.
 *
 * @internal
 */
export function getKeySelector(
  selector: Selector
): IdSelector | ClassSelector | TypeSelector | null {
  switch (selector.type) {
    case SelectorType.IdSelector:
    case SelectorType.ClassSelector:
      return selector;

    case SelectorType.TypeSelector:
      return selector.name === "*" ? null : selector;

    case SelectorType.CompoundSelector:
      const left = getKeySelector(selector.left);

      if (left === null) {
        return getKeySelector(selector.right);
      }

      return left;

    case SelectorType.RelativeSelector:
      return getKeySelector(selector.right);
  }

  return null;
}
