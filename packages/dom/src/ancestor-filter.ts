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

  public add(element: Element): void {
    if (this._elements.has(element)) {
      return;
    }

    this._elements.add(element);

    const id = getAttribute(element, "id");

    if (id !== null) {
      addEntry(this._ids, id);
    }

    addEntry(this._types, element.localName);

    for (const className of getClassList(element)) {
      addEntry(this._classes, className);
    }
  }

  public remove(element: Element): void {
    if (!this._elements.has(element)) {
      return;
    }

    this._elements.delete(element);

    const id = getAttribute(element, "id");

    if (id !== null) {
      removeEntry(this._ids, id);
    }

    removeEntry(this._types, element.localName);

    for (const className of getClassList(element)) {
      removeEntry(this._classes, className);
    }
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
