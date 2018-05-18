import { IdSelector, ClassSelector, TypeSelector } from "@siteimprove/alfa-css";
import { Element } from "./types";
import { getAttribute } from "./get-attribute";
import { getClassList } from "./get-class-list";

/**
 * @internal
 */
export class AncestorFilter {
  private _ids: AncestorBucket = new Map();

  private _classes: AncestorBucket = new Map();

  private _types: AncestorBucket = new Map();

  private _elements: Set<Element> = new Set();

  private process(
    element: Element,
    fn: (bucket: AncestorBucket, entry: string) => void
  ) {
    const id = getAttribute(element, "id");

    if (id !== null) {
      fn(this._ids, id);
    }

    fn(this._types, element.localName);

    for (const className of getClassList(element)) {
      fn(this._classes, className);
    }
  }

  public add(element: Element): void {
    if (this._elements.has(element)) {
      return;
    }

    this._elements.add(element);

    this.process(element, addEntry);
  }

  public remove(element: Element): void {
    if (!this._elements.has(element)) {
      return;
    }

    this._elements.delete(element);

    this.process(element, removeEntry);
  }

  public matches(selector: IdSelector | ClassSelector | TypeSelector): boolean {
    let bucket: AncestorBucket;

    switch (selector.type) {
      case "id-selector":
        bucket = this._ids;
        break;
      case "class-selector":
        bucket = this._classes;
        break;
      case "type-selector":
      default:
        bucket = this._types;
    }

    return bucket.has(selector.name);
  }
}

/**
 * While most browser implementations use bloom filters for ancestor filters, we
 * can make do with native maps for two reasons: Memory is not much of a concern
 * as we only ever compute cascade once for every context, and native maps are
 * actually much faster than any bloom filter we might be able to cook up in
 * plain JavaScript.
 */
type AncestorBucket = Map<string, number>;

function addEntry(bucket: AncestorBucket, entry: string): void {
  const count = bucket.get(entry);

  if (count === undefined) {
    bucket.set(entry, 1);
  } else {
    bucket.set(entry, count + 1);
  }
}

function removeEntry(bucket: AncestorBucket, entry: string): void {
  const count = bucket.get(entry);

  if (count === undefined) {
    return;
  }

  if (count === 1) {
    bucket.delete(entry);
  } else {
    bucket.set(entry, count - 1);
  }
}
