import { Selector, SelectorType } from "@siteimprove/alfa-css";

const { min } = Math;

export type Specificity = number;

// The number of bits to use for every component of the specificity computation.
// As bitwise operations in JavaScript are limited to 32 bits, we can only use
// at most 10 bits per component as 3 components are used.
const componentBits = 10;

// The maximum value that any given component can have. Since we can only use 10
// bits for every component, this in effect means that any given component count
// must be strictly less than 1024.
const componentMax = (1 << componentBits) - 1;

/**
 * @see https://www.w3.org/TR/selectors/#specificity
 * @internal
 */
export function getSpecificity(selector: Selector): Specificity {
  let a = 0;
  let b = 0;
  let c = 0;

  const queue: Array<Selector> = [selector];

  while (queue.length > 0) {
    const selector = queue.pop();

    if (selector === undefined) {
      break;
    }

    switch (selector.type) {
      case SelectorType.IdSelector:
        a++;
        break;
      case SelectorType.ClassSelector:
      case SelectorType.AttributeSelector:
      case SelectorType.PseudoClassSelector:
        b++;
        break;
      case SelectorType.TypeSelector:
        if (selector.name !== "*") {
          c++;
        }
        break;
      case SelectorType.PseudoElementSelector:
        c++;
        break;
      case SelectorType.CompoundSelector:
      case SelectorType.RelativeSelector:
        queue.push(selector.left, selector.right);
    }
  }

  // Concatenate the components to a single number indicating the specificity of
  // the selector. This allows us to treat specificities as simple numbers and
  // hence use normal comparison operators when comparing specificities.
  return (
    (min(a, componentMax) << (componentBits * 2)) |
    (min(b, componentMax) << (componentBits * 1)) |
    min(c, componentMax)
  );
}
