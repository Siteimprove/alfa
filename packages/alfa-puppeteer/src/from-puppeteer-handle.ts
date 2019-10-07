import * as dom from "@siteimprove/alfa-dom";
import { JSHandle } from "puppeteer";
import { rollup } from "rollup";
import cjs from "rollup-plugin-commonjs";

const clone = rollup({
  input: require.resolve("@siteimprove/alfa-dom/src/clone"),
  plugins: [cjs()]
}).then(async bundle => {
  const { output } = await bundle.generate({
    format: "iife",
    exports: "named",
    name: "dom"
  });

  const [{ code }] = output;

  const clone = new Function("node", `${code} return dom.clone(node)`);

  return clone as (node: Node) => dom.Node;
});

export async function fromPuppeteerHandle(
  handle: JSHandle<Document | Element>
): Promise<dom.Document | dom.Element> {
  return (await handle.evaluate(await clone)) as dom.Document | dom.Element;
}
