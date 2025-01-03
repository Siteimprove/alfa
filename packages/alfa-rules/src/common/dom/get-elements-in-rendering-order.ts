import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as tree from "@siteimprove/alfa-tree";

const { and } = Refinement;
const { hasComputedStyle, isRendered } = Style;

const cache = Cache.empty<Device, Cache<Node, Sequence<Element>>>();

export function getElementsInRenderingOrder(
  element: Element,
  device: Device,
): Sequence<Element> {
  const root = element
    .root(Node.flatTree)
    .inclusiveDescendants()
    .find(Element.isElement)
    .getUnsafe();

  return cache.get(device, Cache.empty).get(root, () =>
    RenderingNode.fromElement(root, device)
      .run()
      .inclusiveDescendants()
      .map((renderingNode) => renderingNode.element),
  );
}

class RenderingNode extends tree.Node<0, "rendering-node"> {
  constructor(element: Element, children: Array<RenderingNode>) {
    super(children, "rendering-node");
    this._element = element;
  }

  private readonly _element: Element;

  public get element() {
    return this._element;
  }

  public inclusiveDescendants(): Sequence<RenderingNode> {
    return super.inclusiveDescendants() as Sequence<RenderingNode>;
  }
}

namespace RenderingNode {
  export function fromElement(
    element: Element,
    device: Device,
  ): Trampoline<RenderingNode> {
    const rendered = isRendered(device);

    const createsStackingContext = and(
      hasComputedStyle(
        "position",
        (position) => position.value !== "static",
        device,
      ),
      hasComputedStyle("z-index", (zIndex) => zIndex.value !== "auto", device),
    );

    function compareStackingContexts(ctx1: RenderingNode, ctx2: RenderingNode) {
      const zIndex1 = Style.from(ctx1.element, device).computed("z-index").value
        .value as number;
      const zIndex2 = Style.from(ctx2.element, device).computed("z-index").value
        .value as number;

      return zIndex1 < zIndex2 ? -1 : zIndex1 > zIndex2 ? 1 : 0;
    }

    return Trampoline.traverse(
      element.children().filter(and(Element.isElement, rendered)),
      (child) => RenderingNode.fromElement(child, device),
    ).map((children) => {
      const stackingContexts: Array<RenderingNode> = [];
      const staticElements: Array<RenderingNode> = [];

      for (let node of children) {
        if (createsStackingContext(node.element)) {
          stackingContexts.push(node);
        } else {
          staticElements.push(node);
        }
      }

      stackingContexts.sort(compareStackingContexts);

      return new RenderingNode(
        element,
        staticElements.concat(stackingContexts),
      );
    });
  }
}
