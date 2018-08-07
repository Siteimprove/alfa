import { getTabIndex } from "./get-tab-index";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element } from "./types";

function indexWithin(array: Array<Element>, element: Element) {
  let lower = 0;
  let upper = array.length;
  const index = getTabIndex(element) as number;

  if (index === 0) {
    return upper;
  }

  while (lower < upper) {
    const middle = (lower + (upper - lower) / 2) | 0;
    const other = getTabIndex(array[middle]) as number;
    if (other <= index && other !== 0) {
      lower = middle + 1;
    } else {
      upper = middle;
    }
  }
  return lower;
}

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabSequence(element: Element): Array<Element> {
  const result: Array<Element> = [];

  traverseNode(element, {
    enter(node, parent) {
      if (!isElement(node)) {
        return;
      }

      const index = getTabIndex(node);
      if (index !== null && index >= 0) {
        const location = indexWithin(result, node);
        result.splice(location, 0, node);
      }
    }
  });

  return result;
}
