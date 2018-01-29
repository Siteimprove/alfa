import { Element, Attribute } from "../types";

export type AttributeOptions = Readonly<{ trim?: boolean }>;

export function attribute<K extends keyof Element["attributes"]>(
  element: Element,
  name: K,
  options: AttributeOptions = { trim: false }
): Element["attributes"][K] {
  let value = element.attributes[name];

  if (typeof value === "string" && options.trim) {
    value = value.trim();
  }

  return value;
}
