import * as V from "@alfa/dom";
import { Layout } from "@alfa/layout";

const { assign } = Object;

export type WithLayout<T extends V.Element> = T & { layout: Layout };

export function hasLayout<T extends V.Element>(
  element: T
): element is WithLayout<T> {
  return "layout" in element;
}

export function layout(
  element: V.Element,
  reference: Element
): WithLayout<V.Element> {
  const { ownerDocument } = reference;
  const { defaultView } = ownerDocument;
  const { pageXOffset, pageYOffset } = defaultView;

  // Only IE and Edge return a non-standard ClientRect object so we force the
  // compiler to think that a standard DOMRect is returned.
  const { x, y, width, height } = reference.getBoundingClientRect() as DOMRect;

  return assign(element, {
    layout: {
      x: x + pageXOffset,
      y: y + pageYOffset,
      width,
      height
    }
  });
}
