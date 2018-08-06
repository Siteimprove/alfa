import { getTabIndex } from "./get-tab-index";
import { Element, Node, NodeType } from "./types";

export interface TabIndexedElement extends Element {
  index: number;
}

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabSequence(
  element: Element,
  tabSequence: Array<TabIndexedElement> = []
): Array<TabIndexedElement> {
  (<Array<Node>>element.childNodes).forEach(element => {
    if (element.nodeType === NodeType.Element) {
      getTabSequence(<TabIndexedElement>element, tabSequence);
    }
  });

  const index = getTabIndex(element);

  if (index === null || index === -1) {
    return tabSequence;
  }

  const weightedElement = <TabIndexedElement>element;

  if (index > 0) {
    weightedElement.index = index - 1;
  }

  if (index === 0) {
    weightedElement.index = Number.MAX_SAFE_INTEGER;
  }

  tabSequence.push(weightedElement);

  return tabSequence.sort((a, b) => a.index - b.index);
}
