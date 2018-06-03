import { IdSelector, ClassSelector, TypeSelector } from "@siteimprove/alfa-css";
import { Element } from "./types";
import { getAttribute } from "./get-attribute";
import { getClassList } from "./get-class-list";

/**
 * @internal
 */
export class AncestorFilter {
  private ids: AncestorBucket = new Map();

  private classes: AncestorBucket = new Map();

  private types: AncestorBucket = new Map();

  public add(element: Element): void {
    this.process(element, addEntry);
  }

  public remove(element: Element): void {
    this.process(element, removeEntry);
  }

  public matches(selector: IdSelector | ClassSelector | TypeSelector): boolean {
    let bucket: AncestorBucket;

    switch (selector.type) {
      case "id-selector":
        bucket = this.ids;
        break;
      case "class-selector":
        bucket = this.classes;
        break;
      case "type-selector":
      default:
        bucket = this.types;
    }

    return bucket.has(selector.name);
  }

  private process(
    element: Element,
    fn: (bucket: AncestorBucket, entry: string) => void
  ) {
    // Elements with no child nodes are not relevant for ancestor filtering.
    if (element.childNodes.length === 0) {
      return;
    }

    const id = getAttribute(element, "id");

    if (id !== null) {
      fn(this.ids, id);
    }

    fn(this.types, element.localName);

    for (const className of getClassList(element)) {
      fn(this.classes, className);
    }
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
