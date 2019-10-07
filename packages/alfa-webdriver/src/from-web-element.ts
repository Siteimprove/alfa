import * as dom from "@siteimprove/alfa-dom";
import { rollup } from "rollup";
import cjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { Browser } from "webdriverio";
import { WebElement } from "./types";

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

export async function fromWebElement(
  webElement: WebElement,
  browser: Browser
): Promise<dom.Element> {
  const json = await browser.execute(await clone, webElement);

  return JSON.parse(json) as dom.Element;
}
