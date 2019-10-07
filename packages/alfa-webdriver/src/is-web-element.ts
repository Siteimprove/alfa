import { hasKey, isObject } from "@siteimprove/alfa-util";
import { WebElement } from "./types";

/**
 * @see https://w3c.github.io/webdriver/#dfn-represents-a-web-element
 */
export function isWebElement(input: unknown): input is WebElement {
  return (
    isObject(input) &&
    input !== null &&
    hasKey(input, "element-6066-11e4-a52e-4f735466cecf")
  );
}
