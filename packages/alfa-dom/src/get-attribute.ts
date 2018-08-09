import { Element } from "./types";

const attributeMaps: WeakMap<Element, Map<string, string>> = new WeakMap();

/**
 * Given an element, get the value of the given attribute name of the element.
 * If the element does not have an attribute with the given name then `null` is
 * returned.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-getattribute
 *
 * @example
 * const div = <div title="Foo" />;
 * getAttribute(div, "title");
 * // => "Foo"
 */
export function getAttribute(
  element: Element,
  name: string,
  options: Readonly<{
    trim?: boolean;
    lowerCase?: boolean;
  }> = {}
): string | null {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new Map();

    const { attributes } = element;

    for (let i = 0, n = attributes.length; i < n; i++) {
      const { prefix, localName, value } = attributes[i];

      const qualifiedName =
        prefix === null ? localName : `${prefix}:${localName}`;

      attributeMap.set(qualifiedName, value);
    }

    attributeMaps.set(element, attributeMap);
  }

  let value = attributeMap.get(name);

  if (value === undefined) {
    return null;
  }

  if (options.trim === true) {
    value = value.trim();
  }

  if (options.lowerCase === true) {
    value = value.toLowerCase();
  }

  return value;
}
