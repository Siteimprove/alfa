import {
  Selector,
  IdSelector,
  ClassSelector,
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
    case "id-selector":
    case "class-selector":
      return selector;

    case "type-selector":
      return selector.name === "*" ? null : selector;

    case "compound-selector":
      return getKeySelector(selector.left);

    case "relative-selector":
      return getKeySelector(selector.right);
  }

  return null;
}
