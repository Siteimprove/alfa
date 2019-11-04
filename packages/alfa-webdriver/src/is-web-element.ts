import { WebElement } from "./types";

/**
 * @see https://w3c.github.io/webdriver/#dfn-represents-a-web-element
 */
export function isWebElement(value: unknown): value is WebElement {
  return isObject(value) && WebElement.Reference in value;
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}
