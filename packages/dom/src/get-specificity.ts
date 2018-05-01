import { Selector, parse, isSelector } from "@alfa/css";

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
 */
export function getSpecificity(selector: string | Selector): Specificity {
  if (typeof selector === "string") {
    const parsed = parse(selector);

    if (parsed === null || !isSelector(parsed)) {
      throw new Error(`Not a valid selector: ${selector}`);
    }

    selector = parsed;
  }

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
      case "id-selector":
        a++;
        break;
      case "class-selector":
      case "attribute-selector":
      case "pseudo-class-selector":
        b++;
        break;
      case "type-selector":
        if (selector.name !== "*") {
          c++;
        }
        break;
      case "pseudo-element-selector":
        c++;
        break;
      case "compound-selector":
        queue.push(...selector.selectors);
        break;
      case "relative-selector":
        queue.push(selector.selector);
        queue.push(selector.relative);
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
