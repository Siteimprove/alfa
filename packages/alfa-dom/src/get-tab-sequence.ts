import { Device } from "@siteimprove/alfa-device";
import { getTabIndex } from "./get-tab-index";
import { isElement } from "./guards";
import { isTabbable } from "./is-tabbable";
import { traverseNode } from "./traverse-node";
import { Element, Node } from "./types";

/**
 * Given a node and a context, get the sequential focus navigation order of the
 * node and its children within the context.
 *
 * @see https://www.w3.org/TR/html/editing.html#sequential-focus-navigation
 */
export function getTabSequence(
  node: Node,
  context: Node,
  device: Device
): Iterable<Element> {
  const tabSequence: Array<Element> = [];

  traverseNode(
    node,
    context,
    {
      enter(node) {
        if (isElement(node)) {
          const index = getTabIndex(node, context);

          if (index !== null && index >= 0) {
            tabSequence.splice(
              indexWithin(tabSequence, node, context),
              0,
              node
            );
          }
        }
      }
    },
    { flattened: true }
  );

  for (let i = 0, n = tabSequence.length; i < n; i++) {
    const { contentDocument } = tabSequence[i];

    if (contentDocument !== null && contentDocument !== undefined) {
      const nestedTabSequence = getTabSequence(
        contentDocument,
        context,
        device
      );

      tabSequence.splice(i, 1, ...nestedTabSequence);
    }
  }

  return tabSequence.filter(element => isTabbable(element, context, device));
}

function indexWithin(array: Array<Element>, element: Element, context: Node) {
  let lower = 0;
  let upper = array.length;

  const reference = getTabIndex(element, context) as number;

  if (reference === 0) {
    return upper;
  }

  while (lower < upper) {
    const middle = (lower + (upper - lower) / 2) | 0;
    const other = getTabIndex(array[middle], context) as number;

    if (other <= reference && other !== 0) {
      lower = middle + 1;
    } else {
      upper = middle;
    }
  }

  return lower;
}
