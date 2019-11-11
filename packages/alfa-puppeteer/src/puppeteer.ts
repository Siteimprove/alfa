/// <reference lib="dom" />

import { isDocument, NodeType } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { isFunction, isObject } from "@siteimprove/alfa-guards";
import { Page } from "@siteimprove/alfa-web";
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

export namespace Puppeteer {
  export type Type = JSHandle<Document | Element>;

  export function isType(value: unknown): value is Type {
    return isObject(value) && isFunction(value.dispose);
  }

  export async function asPage(value: Type): Promise<Page> {
    const json = await value.evaluate(await clone);

    const node = JSON.parse(json) as dom.Document | dom.Element;

    return Page.of({
      document: isDocument(node)
        ? node
        : {
            nodeType: NodeType.Document,
            styleSheets: [],
            childNodes: [node]
          }
    });
  }
}
