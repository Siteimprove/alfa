import { Element } from "./types";

export type AttributeOptions = Readonly<{ trim?: boolean }>;

const attributeMaps: WeakMap<Element, AttributeMap> = new WeakMap();

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
  options: AttributeOptions = { trim: false }
): string | null {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new AttributeMap(element);
    attributeMaps.set(element, attributeMap);
  }

  const value = attributeMap.get(name);

  if (value === null) {
    return null;
  }

  return options.trim ? value.trim() : value;
}

class AttributeMap {
  private _attributes: Map<string, string> = new Map();

  public constructor(element: Element) {
    const { length } = element.attributes;

    for (let i = 0; i < length; i++) {
      const { prefix, localName, value } = element.attributes[i];

      const qualifiedName =
        prefix === null ? localName : prefix + ":" + localName;

      this._attributes.set(qualifiedName, value);
    }
  }

  public get(name: string): string | null {
    const value = this._attributes.get(name);

    if (value === undefined) {
      return null;
    }

    return value;
  }
}
