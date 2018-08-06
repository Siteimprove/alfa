import { getTabIndex } from "./get-tab-index";
import { Element, Node, NodeType } from "./types";

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabSequence(
  element: Element,
  tabSequence: Array<Element> = []
): Array<Element> {
  (<Array<Node>>element.childNodes).forEach(element => {
    if (element.nodeType === NodeType.Element) {
      getTabSequence(<Element>element, tabSequence);
    }
  });

  const index = getTabIndex(element);
  if (index === null || index === -1) {
    return tabSequence;
  }

  if (index > 0) {
    tabSequence.splice(index - 1, 0, element);
  }

  if (index === 0) {
    tabSequence.splice(999999, 0, element);
  }

  return tabSequence;
}
