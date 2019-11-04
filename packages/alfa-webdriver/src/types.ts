/**
 * @see https://w3c.github.io/webdriver/#dfn-web-elements
 */
export interface WebElement {
  /**
   * @see https://w3c.github.io/webdriver/#dfn-web-element-reference
   */
  [WebElement.Reference]?: string;
}

export namespace WebElement {
  export const Reference = "element-6066-11e4-a52e-4f735466cecf" as const;
  export type Reference = typeof Reference;
}
