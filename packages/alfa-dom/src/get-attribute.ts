import { find } from "@siteimprove/alfa-util";
import { Element } from "./types";

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
  const { attributes } = element;

  const attribute = find(attributes, (attribute, i) => {
    const { prefix, localName, value } = attribute;

    const qualifiedName =
      prefix === null ? localName : prefix + ":" + localName;

    return qualifiedName === name;
  });

  if (attribute === null) {
    return null;
  }

  let { value } = attribute;

  value = options.trim ? value.trim() : value;
  value = options.lowerCase ? value.toLowerCase() : value;

  return value;
}
