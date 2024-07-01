import type { Element } from "@siteimprove/alfa-dom";

/**
 * @internal
 */
export function isLink(element: Element): boolean {
  switch (element.name) {
    case "a":
    case "area":
    case "link":
      return element.attribute("href").isSome();
  }

  return false;
}
