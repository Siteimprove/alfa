import { Element } from "./types";

export type AttributeOptions = Readonly<{ trim?: boolean }>;

export function getAttribute(
  element: Element,
  name: string,
  options: AttributeOptions = { trim: false }
): string | null {
  for (const attribute of element.attributes) {
    const { value } = attribute;

    if (name === attribute.name) {
      return options.trim ? value.trim() : value;
    }
  }

  return null;
}
