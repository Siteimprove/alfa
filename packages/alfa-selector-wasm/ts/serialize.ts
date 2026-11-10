import type { Element } from "@siteimprove/alfa-dom";
import { Namespace, Node } from "@siteimprove/alfa-dom";

/**
 * Serialize an Alfa DOM subtree into the binary format consumed by the
 * `alfa-selector-wasm` module (see `src/serialization.rs`).
 *
 * Elements are walked in flat-tree pre-order; the resulting index of each
 * element (its position in that walk) is the id used by the WASM `matches`
 * entry point. The returned `ids` map lets callers translate an Alfa
 * `Element` back into its WASM element id.
 *
 * @remarks
 * Milestone 2 handles the light DOM (elements, attributes, classes, id,
 * namespace, tree structure). Shadow DOM / slot flattening beyond what
 * `Node.flatTree` yields, and non-element nodes, are out of scope here.
 */
export interface SerializedDom {
  readonly bytes: Uint8Array;
  readonly ids: Map<Element, number>;
}

const MAGIC = 0x414c4641; // "ALFA"
const VERSION = 1;
const NONE = 0xffffffff;

const FLAG_ROOT = 0b1;

// Traversal that follows the flattened tree (shadow DOM + slots), matching how
// the cascade resolves selectors.
const FLAT_TREE = Node.flatTree;

function isElement(node: Node): node is Element {
  return node.type === "element";
}

/**
 * Interns strings, guaranteeing index 0 is the empty string (matching the
 * crawler's protobuf convention and the Rust decoder's expectation).
 */
class StringTable {
  private readonly index = new Map<string, number>();
  private readonly list: Array<string> = [];

  public constructor() {
    this.intern("");
  }

  public intern(value: string): number {
    const existing = this.index.get(value);
    if (existing !== undefined) {
      return existing;
    }
    const id = this.list.length;
    this.list.push(value);
    this.index.set(value, id);
    return id;
  }

  public get strings(): ReadonlyArray<string> {
    return this.list;
  }
}

/**
 * Growable little-endian byte writer.
 */
class Writer {
  private buffer = new Uint8Array(1024);
  private view = new DataView(this.buffer.buffer);
  private length = 0;

  private ensure(extra: number): void {
    if (this.length + extra <= this.buffer.length) {
      return;
    }
    let capacity = this.buffer.length * 2;
    while (capacity < this.length + extra) {
      capacity *= 2;
    }
    const grown = new Uint8Array(capacity);
    grown.set(this.buffer.subarray(0, this.length));
    this.buffer = grown;
    this.view = new DataView(this.buffer.buffer);
  }

  public u8(value: number): void {
    this.ensure(1);
    this.view.setUint8(this.length, value);
    this.length += 1;
  }

  public u32(value: number): void {
    this.ensure(4);
    this.view.setUint32(this.length, value >>> 0, true);
    this.length += 4;
  }

  public bytes(value: Uint8Array): void {
    this.ensure(value.length);
    this.buffer.set(value, this.length);
    this.length += value.length;
  }

  public finish(): Uint8Array {
    return this.buffer.subarray(0, this.length);
  }
}

interface ElementRecord {
  readonly element: Element;
  readonly parent: number;
  firstChild: number;
  nextSibling: number;
  prevSibling: number;
  readonly isRoot: boolean;
}

const encoder = new TextEncoder();

export function serialize(root: Node): SerializedDom {
  const strings = new StringTable();
  const ids = new Map<Element, number>();
  const records: Array<ElementRecord> = [];

  // Assign ids in flat-tree pre-order, recording tree structure as explicit
  // O(1) sibling/child pointers.
  function walk(node: Node, parent: number, isRoot: boolean): number {
    if (!isElement(node)) {
      // Recurse through non-element nodes without emitting a record, so their
      // element descendants still attach to the nearest element ancestor.
      let firstEmitted = NONE;
      let prev = NONE;
      for (const child of node.children(FLAT_TREE)) {
        const emitted = walk(child, parent, false);
        if (emitted !== NONE) {
          if (firstEmitted === NONE) {
            firstEmitted = emitted;
          }
          linkSiblings(prev, emitted);
          prev = emitted;
        }
      }
      return firstEmitted;
    }

    const id = records.length;
    ids.set(node, id);
    const record: ElementRecord = {
      element: node,
      parent,
      firstChild: NONE,
      nextSibling: NONE,
      prevSibling: NONE,
      isRoot,
    };
    records.push(record);

    let firstChild = NONE;
    let prev = NONE;
    for (const child of node.children(FLAT_TREE)) {
      const emitted = walk(child, id, false);
      if (emitted !== NONE) {
        if (firstChild === NONE) {
          firstChild = emitted;
        }
        linkSiblings(prev, emitted);
        prev = emitted;
      }
    }
    record.firstChild = firstChild;

    return id;
  }

  function linkSiblings(prev: number, next: number): void {
    if (prev !== NONE) {
      records[prev].nextSibling = next;
      records[next].prevSibling = prev;
    }
  }

  walk(root, NONE, true);

  // Encode.
  const body = new Writer();
  for (const record of records) {
    const element = record.element;

    body.u32(strings.intern(element.name));
    body.u32(strings.intern(namespaceOf(element)));

    const id = element.id;
    body.u32(id.isSome() ? strings.intern(id.get()) : NONE);

    body.u32(record.parent);
    body.u32(record.firstChild);
    body.u32(record.nextSibling);
    body.u32(record.prevSibling);

    body.u8(record.isRoot ? FLAG_ROOT : 0);

    const classes = [...element.classes];
    body.u32(classes.length);
    for (const className of classes) {
      body.u32(strings.intern(className));
    }

    const attributes = [...element.attributes];
    body.u32(attributes.length);
    for (const attribute of attributes) {
      body.u32(strings.intern(attribute.name));
      body.u32(strings.intern(attribute.value));
    }
  }

  // Assemble header + string table + body. The string table must be written
  // after the body since interning happens during body encoding.
  const out = new Writer();
  out.u32(MAGIC);
  out.u32(VERSION);
  out.u32(strings.strings.length);
  out.u32(records.length);

  for (const string of strings.strings) {
    const encoded = encoder.encode(string);
    out.u32(encoded.length);
    out.bytes(encoded);
  }

  out.bytes(body.finish());

  return { bytes: out.finish(), ids };
}

function namespaceOf(element: Element): string {
  return element.namespace
    .map((ns) => (ns === Namespace.HTML ? "" : (ns as string)))
    .getOr("");
}
