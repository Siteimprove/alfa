import { getTabIndex } from "./get-tab-index";
import { traverseNode } from "./traverse-node";
import { Element, NodeType } from "./types";

function binaryInsert(
  arr: Array<Element>,
  element: Element,
  index: number,
  i: number,
  depth = 0
) {
  if (arr.length === 0) {
    arr.push(element);
  }

  const competitorIndex = getTabIndex(arr[i]);

  if (competitorIndex === null) {
    return;
  }

  if (competitorIndex < index) {
    binaryInsert(arr, element, index, i + i / 2);
  }

  if (competitorIndex > index) {
    binaryInsert(arr, element, index, i - i / 2);
  }

  arr.splice(i, 0, element);
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
        binaryInsert(
          result,
          <Element>node,
          index,
          Math.floor(result.length / 2)
        );
      }
    }
  });

  return result;
}
