import { first } from "@alfa/util";
import {
  Selector,
  SimpleSelector,
  parse,
  isSelector,
  isSimpleSelector,
  isCompoundSelector,
  isRelativeSelector
} from "@alfa/css";

/**
 * Given a selector, get the right-most simple selector, i.e. the key selector.
 * The key selector is the most important selector when performing selector
 * matching as an element won't match a given selector unless it also matches
 * the key selector.
 */
export function getKeySelector(selector: string | Selector): SimpleSelector {
  if (typeof selector === "string") {
    const parsed = parse(selector);

    if (parsed === null || !isSelector(parsed)) {
      throw new Error(`Not a valid selector: ${selector}`);
    }

    selector = parsed;
  }

  if (isSimpleSelector(selector)) {
    return selector;
  }

  if (isCompoundSelector(selector)) {
    return getKeySelector(first(selector.selectors) as SimpleSelector);
  }

  return getKeySelector(selector.selector);
}
