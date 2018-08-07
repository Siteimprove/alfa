import { getTabIndex } from "./get-tab-index";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

/**
 * @see https://www.w3.org/TR/html/editing.html#sequential-focus-navigation
 */
export function getTabSequence(
  node: Node,
  context: Node
): Readonly<Array<Element>> {
  const result: Array<Element> = [];

  traverseNode(node, context, {
    enter(node) {
      if (isElement(node)) {
        const index = getTabIndex(node);

        if (index !== null && index >= 0) {
          result.splice(indexWithin(result, node), 0, node);
        }
      }
    }
  });

  return result;
}

function indexWithin(array: Array<Element>, element: Element) {
  let lower = 0;
  let upper = array.length;

  const reference = getTabIndex(element) as number;

  if (reference === 0) {
    return upper;
  }

  while (lower < upper) {
    const middle = (lower + (upper - lower) / 2) | 0;
    const other = getTabIndex(array[middle]) as number;

    if (other <= reference && other !== 0) {
      lower = middle + 1;
    } else {
      upper = middle;
    }
  }

  return lower;
}
