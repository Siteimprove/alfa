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
 *
 * @remarks
 * The generated WASM module keeps its DOM arena in module-global state, and
 * there is exactly one instance of the compiled module per process (Node's
 * `require()` caches it by resolved path). `SelectorEngine` reflects that by
 * being a process-wide singleton itself: rather than pretending each `load()`
 * call owns independent state, it tracks which tree is currently loaded and
 * only re-serializes when `loadDom` is called for a different one. This
 * matters once multiple trees are matched against over the engine's
 * lifetime, e.g. cascades for different documents, or nested shadow trees.
 */
export class SelectorEngine {
  private static instance: SelectorEngine | undefined;

  private readonly wasm: WasmExports;
  private ids: Map<Element, number> = new Map();
  private loadedRoot: Node | undefined;

  private constructor(wasm: WasmExports) {
    this.wasm = wasm;
  }

  /**
   * Get the process-wide selector engine, loading the WASM module on first
   * use. The generated bindings are CommonJS, so we bridge via
   * `createRequire`.
   */
  public static load(): SelectorEngine {
    if (SelectorEngine.instance === undefined) {
      const require = createRequire(import.meta.url);
      const wasmPath = fileURLToPath(
        new URL("../pkg/alfa_selector_wasm.js", import.meta.url),
      );
      const wasm = require(wasmPath) as WasmExports;
      SelectorEngine.instance = new SelectorEngine(wasm);
    }

    return SelectorEngine.instance;
  }

  /**
   * Ensure `root`'s DOM is the one currently loaded into the engine,
   * (re)serializing and loading it if it isn't already. A no-op if `root` is
   * already loaded, since callers may share this engine across multiple
   * trees and repeatedly re-assert the one they need.
   */
  public loadDom(root: Node): void {
    if (this.loadedRoot === root) {
      return;
    }

    const { bytes, ids } = serialize(root);
    const error = this.wasm.load_dom(bytes);
    if (error !== "") {
      throw new Error(`Failed to load DOM into WASM: ${error}`);
    }
    this.ids = ids;
    this.loadedRoot = root;
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
    this.loadedRoot = undefined;
  }
}
