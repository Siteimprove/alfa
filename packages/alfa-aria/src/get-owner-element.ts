import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getAttribute,
  getParentElement,
  getRootNode,
  isElement,
  Node,
  traverseNode
} from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";
import { isExposed } from "./is-exposed";
import { resolveReferences } from "./resolve-references";

const { map } = BrowserSpecific;

const ownerElementMaps = new WeakMap<Node, WeakMap<Element, Element>>();

export function getOwnerElement(
  element: Element,
  context: Node,
  device: Device
): Option<Element> | BrowserSpecific<Option<Element>> {
  let ownerElementMap = ownerElementMaps.get(context);

  if (ownerElementMap === undefined) {
    ownerElementMap = new WeakMap();

    traverseNode(
      context,
      context,
      {
        enter(node) {
          if (isElement(node)) {
            const owns = getAttribute(node, "aria-owns");

            if (owns !== null) {
              const references = resolveReferences(
                getRootNode(node, context),
                context,
                owns
              );

              for (const reference of references) {
                ownerElementMap!.set(reference, node);
              }
            }
          }
        }
      },
      {
        composed: true
      }
    );

    ownerElementMaps.set(context, ownerElementMap);
  }

  const ownerElement = ownerElementMap.get(element);

  if (ownerElement !== undefined) {
    return ownerElement;
  }

  return getExposedAncestor(element, context, device);
}

function getExposedAncestor(
  element: Element,
  context: Node,
  device: Device
): Option<Element> | BrowserSpecific<Option<Element>> {
  const parentElement = getParentElement(element, context);

  if (parentElement === null) {
    return null;
  }

  return map(isExposed(parentElement, context, device), isExposed => {
    if (isExposed) {
      return parentElement;
    }

    return getExposedAncestor(parentElement, context, device);
  });
}
