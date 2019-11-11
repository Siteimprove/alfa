/// <reference lib="dom" />

import { NodeType } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { isObject } from "@siteimprove/alfa-guards";
import { Page } from "@siteimprove/alfa-web";
import { rollup } from "rollup";
import cjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { Browser } from "webdriverio";

const clone = rollup({
  input: require.resolve("@siteimprove/alfa-dom/src/clone"),
  plugins: [cjs(), terser()]
}).then(async bundle => {
  const { output } = await bundle.generate({
    format: "iife",
    exports: "named",
    name: "dom",
    preferConst: true
  });

  const [{ code }] = output;

  const clone = new Function(
    "node",
    `${code} return JSON.stringify(dom.clone(node))`
  );

  return clone as (node: Node) => string;
});

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

  /**
   * @see https://w3c.github.io/webdriver/#dfn-represents-a-web-element
   */
  export function isWebElement(value: unknown): value is WebElement {
    return isObject(value) && Reference in value;
  }

  export async function asPage(
    webElement: WebElement,
    browser: Browser
  ): Promise<Page> {
    const json = await browser.execute(await clone, webElement);

    const node = JSON.parse(json) as dom.Element;

    return Page.of({
      document: {
        nodeType: NodeType.Document,
        styleSheets: [],
        childNodes: [node]
      }
    });
  }
}
