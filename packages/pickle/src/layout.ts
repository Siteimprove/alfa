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
  const { left, right, top, bottom } = reference.getBoundingClientRect();

  return assign(element, {
    layout: { left, right, top, bottom }
  });
}
