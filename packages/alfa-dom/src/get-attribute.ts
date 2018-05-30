import { Element } from "./types";

const attributeMaps: WeakMap<Element, Map<string, string>> = new WeakMap();

export type AttributeOptions = Readonly<{
  trim?: boolean;
  lowerCase?: boolean;
}>;

/**
 * Given an element, get the value of the specified attribute of the element.
 *
 * @example
 * const div = <div title="Foo" />;
 * getAttribute(div, "title");
 * // => "Foo"
 */
export function getAttribute(
  element: Element,
  name: string,
  options: AttributeOptions = {}
): string | null {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new Map();

    const { attributes } = element;

    for (let i = 0, n = attributes.length; i < n; i++) {
      const { prefix, localName, value } = attributes[i];

      const qualifiedName =
        prefix === null ? localName : prefix + ":" + localName;

      attributeMap.set(qualifiedName, value);
    }

    attributeMaps.set(element, attributeMap);
  }

  let value = attributeMap.get(name);

  if (value === undefined) {
    return null;
  }

  value = options.trim ? value.trim() : value;
  value = options.lowerCase ? value.toLowerCase() : value;

  return value;
}
