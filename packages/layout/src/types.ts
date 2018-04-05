import { Element } from "@alfa/dom";

/**
 * @see https://www.w3.org/TR/geometry/#DOMRect
 */
export interface Layout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type LayoutSheet = Array<{
  readonly element: Element;
  readonly layout: Layout;
}>;
