import * as dom from "@siteimprove/alfa-dom";
import { JSHandle } from "puppeteer";
import { rollup } from "rollup";
import cjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

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

export async function fromPuppeteerHandle(
  handle: JSHandle<Document | Element>
): Promise<dom.Document | dom.Element> {
  const json = await handle.evaluate(await clone);

  return JSON.parse(json) as dom.Document | dom.Element;
}
