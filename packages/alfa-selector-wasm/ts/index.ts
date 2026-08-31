import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import type { Element, Node } from "@siteimprove/alfa-dom";

import { serialize } from "./serialize.ts";

/**
 * The raw functions exported by the generated `wasm-bindgen` module.
 */
interface WasmExports {
  load_dom(data: Uint8Array): string;
  parse_selector(text: string): number;
  specificity(selector_id: number): number;
  matches(selector_id: number, element_id: number): boolean;
  clear(): void;
}

/**
 * A loaded selector engine bound to a single DOM.
 */
export class SelectorEngine {
  private readonly wasm: WasmExports;
  private ids: Map<Element, number> = new Map();

  private constructor(wasm: WasmExports) {
    this.wasm = wasm;
  }

  /**
   * Load the WASM module. The generated bindings are CommonJS, so we bridge
   * via `createRequire`.
   */
  public static load(): SelectorEngine {
    const require = createRequire(import.meta.url);
    const wasmPath = fileURLToPath(
      new URL("../pkg/alfa_selector_wasm.js", import.meta.url),
    );
    const wasm = require(wasmPath) as WasmExports;
    return new SelectorEngine(wasm);
  }

  /**
   * Serialize an Alfa DOM subtree and load it into the WASM module. Subsequent
   * `matches` calls resolve against this tree.
   */
  public loadDom(root: Node): void {
    const { bytes, ids } = serialize(root);
    const error = this.wasm.load_dom(bytes);
    if (error !== "") {
      throw new Error(`Failed to load DOM into WASM: ${error}`);
    }
    this.ids = ids;
  }

  /**
   * Parse a CSS selector. Returns a selector id, or -1 on parse error.
   */
  public parseSelector(text: string): number {
    return this.wasm.parse_selector(text);
  }

  /**
   * Decode a selector's packed specificity into an `(a, b, c)` tuple.
   */
  public specificity(selectorId: number): [number, number, number] {
    const packed = this.wasm.specificity(selectorId);
    return [(packed >>> 20) & 0x3ff, (packed >>> 10) & 0x3ff, packed & 0x3ff];
  }

  /**
   * Test whether an Alfa element matches a parsed selector.
   */
  public matches(selectorId: number, element: Element): boolean {
    const id = this.ids.get(element);
    if (id === undefined) {
      return false;
    }
    return this.wasm.matches(selectorId, id);
  }

  public clear(): void {
    this.wasm.clear();
    this.ids = new Map();
  }
}
