import { getTabIndex } from "./get-tab-index";
import { traverseNode } from "./traverse-node";
import { Element, NodeType } from "./types";

function binaryIndexSearch(array: Array<Element>, index: number) {
  let low = 0;
  let high = array.length;

  if (index === 0) {
    return high;
  }

  while (low < high) {
    const mid = (low + high) >>> 1;
    const other = <number>getTabIndex(array[mid]);
    if (other <= index && other !== 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabSequence(element: Element): Array<Element> {
  const result = <Array<Element>>[];

  traverseNode(element, {
    enter(node, parent) {
      if (node.nodeType !== NodeType.Element) {
        return;
      }

      const index = getTabIndex(<Element>node);
      if (index !== null && index >= 0) {
        const location = binaryIndexSearch(result, index);
        result.splice(location, 0, <Element>node);
      }
    }
  });

  return result;
}
