import { Layout } from "@alfa/layout";

export function layout(element: Element): Layout {
  const { ownerDocument } = element;
  const { defaultView } = ownerDocument;
  const { pageXOffset, pageYOffset } = defaultView;

  if (element.getClientRects().length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Only IE and Edge return a non-standard ClientRect object so we force the
  // compiler to think that a standard DOMRect is returned.
  const { x, y, width, height } = element.getBoundingClientRect() as DOMRect;

  return {
    x: x + pageXOffset,
    y: y + pageYOffset,
    width,
    height
  };
}
