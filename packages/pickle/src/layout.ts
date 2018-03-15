import * as V from "@alfa/dom";
import { Layout } from "@alfa/layout";
import { WithReference, hasReference } from "./virtualize";

const { assign } = Object;
const { isElement, traverse } = V;

export type WithLayout<T extends V.Element> = T & { layout: Layout };

export function hasLayout<T extends V.Element>(
  element: T
): element is WithLayout<T> {
  return "layout" in element;
}

export function layout(root: WithReference<V.Node>): V.Node {
  traverse(root, node => {
    if (isElement(node) && hasReference(node)) {
      const {
        left,
        right,
        top,
        bottom
      } = (node.ref as Element).getBoundingClientRect();

      assign(node, {
        layout: { left, right, top, bottom }
      });
    }
  });

  return root;
}
