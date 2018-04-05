import { Element } from "@alfa/dom";
import { Style, StyleSheet } from "./types";

export function getStyle(
  styleSheet: StyleSheet,
  element: Element
): Style | null {
  const { length } = styleSheet;

  for (let i = 0; i < length; i++) {
    const found = styleSheet[i];

    if (found.element === element) {
      return found.style;
    }
  }

  return null;
}
