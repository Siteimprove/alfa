import { each } from "@siteimprove/alfa-util";
import { Element } from "./types";

export type AttributeOptions = Readonly<{
  trim?: boolean;
  lowerCase?: boolean;
}>;

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
  options: AttributeOptions = {}
): string | null {
  let attributeMap = attributeMaps.get(element);

  if (attributeMap === undefined) {
    attributeMap = new AttributeMap(element);
    attributeMaps.set(element, attributeMap);
  }

  let value = attributeMap.get(name);

  if (value === null) {
    return null;
  }

  value = options.trim ? value.trim() : value;
  value = options.lowerCase ? value.toLowerCase() : value;

  return value;
}

class AttributeMap {
  private _attributes: Map<string, string> = new Map();

  public constructor(element: Element) {
    const { length } = element.attributes;

    each(element.attributes, attribute => {
      const { prefix, localName, value } = attribute;

      const qualifiedName =
        prefix === null ? localName : prefix + ":" + localName;

      this._attributes.set(qualifiedName, value);
    });
  }

  public get(name: string): string | null {
    const value = this._attributes.get(name);

    if (value === undefined) {
      return null;
    }

    return value;
  }
}
