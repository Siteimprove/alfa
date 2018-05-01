import { first } from "@alfa/util";
import {
  Selector,
  SimpleSelector,
  parse,
  isSelector,
  isSimpleSelector,
  isRelativeSelector
} from "@alfa/css";

/**
 * Given a selector, get the right-most simple selector, i.e. the key selector.
 * The key selector is the most important selector when performing selector
 * matching as an element won't match a given selector unless it also matches
 * the key selector.
 */
export function getKeySelector(
  selector: string | Selector
): SimpleSelector | null {
  if (typeof selector === "string") {
    const parsed = parse(selector);

    if (parsed === null || !isSelector(parsed)) {
      throw new Error(`Not a valid selector: ${selector}`);
    }

    selector = parsed;
  }

  if (isSimpleSelector(selector)) {
    if (selector.type === "type-selector" && selector.name === "*") {
      return null;
    }

    return selector;
  }

  if (isRelativeSelector(selector)) {
    return getKeySelector(selector.selector);
  }

  const { selectors } = selector;

  for (let i = 0, n = selectors.length; i < n; i++) {
    const selector = getKeySelector(selectors[i]);

    if (selector !== null) {
      return selector;
    }
  }

  return null;
}
