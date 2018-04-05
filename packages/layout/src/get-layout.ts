import { Element } from "@alfa/dom";
import { Layout, LayoutSheet } from "./layout";

export function getLayout(
  layoutSheet: LayoutSheet,
  element: Element
): Layout | null {
  const { length } = layoutSheet;

  for (let i = 0; i < length; i++) {
    const found = layoutSheet[i];

    if (found.element === element) {
      return found.layout;
    }
  }

  return null;
}
