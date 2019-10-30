import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
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
import { None, Option, Some } from "@siteimprove/alfa-option";
import { isExposed } from "./is-exposed";
import { resolveReferences } from "./resolve-references";

const ownerElements = Cache.empty<Node, Cache<Element, Element>>();

export function getOwnerElement(
  element: Element,
  context: Node,
  device: Device
): Branched<Option<Element>, Browser.Release> {
  const ownerElement = ownerElements
    .get(context, () =>
      Cache.from(
        traverseNode(
          context,
          context,
          {
            *enter(node) {
              if (isElement(node)) {
                const owns = getAttribute(node, context, "aria-owns").getOr(
                  null
                );

                if (owns !== null) {
                  const references = resolveReferences(
                    getRootNode(node, context),
                    context,
                    owns
                  );

                  for (const reference of references) {
                    yield [reference, node];
                  }
                }
              }
            }
          },
          { composed: true, nested: true }
        )
      )
    )
    .get(element);

  return isExposed(element, context, device).flatMap(isExposed => {
    if (!isExposed) {
      return Branched.of(None);
    }

    if (ownerElement.isSome()) {
      return Branched.of(ownerElement);
    }

    return getExposedAncestor(element, context, device);
  });
}

function getExposedAncestor(
  element: Element,
  context: Node,
  device: Device
): Branched<Option<Element>, Browser.Release> {
  const parentElement = getParentElement(element, context).getOr(null);

  if (parentElement === null) {
    return Branched.of(None);
  }

  return isExposed(parentElement, context, device).flatMap(isExposed => {
    if (isExposed) {
      return Branched.of(Some.of(parentElement));
    }

    return getExposedAncestor(parentElement, context, device);
  });
}
