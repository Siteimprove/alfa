import { Element } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Class, Id, Selector, Type } from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

/**
 * The ancestor filter is a data structure used for optimising selector matching
 * in the case of descendant selectors.
 *
 * @remarks
 * When traversing down through the DOM tree during selector matching, the
 * ancestor filter stores information about the ancestor elements that are
 * found up the path from the element that is currently being visited.
 * Given an element and a descendant selector, we can therefore quickly
 * determine if the selector might match an ancestor of the current element.
 *
 * The ancestor filter simply count the number of each ID, class, and type
 * amongst the path walked so far. When a descendant selector is encountered, we
 * can quickly see if the ancestor filter contains the ID, class, or type of the
 * ancestor bit, without walking up the full tree again.
 *
 * We need to remember exact count rather than just existence because the
 * initial build of the cascade traverses the tree in depth-first order and
 * therefore needs to be able to *remove* item from the filter when going up.
 *
 * For example, consider the following DOM tree:
 *
 * section#content
 * +-- blockquote
 * +-- p.highlight
 *     +-- b
 *
 * For the `<b>` element, the ancestor filter would be:
 * { ids: [["content", 1]],
 *   classes: [["highlight", 1]],
 *   types: [["p", 1], ["section", 1]]}
 * Given a selector `main b`, we can therefore reject that the selector would
 * match the `<b>` as the ancestor filter does not contain the type `main`.
 *
 * NB: None of the operations of the ancestor filter are idempotent to avoid
 * keeping track of more information than strictly necessary. This is however
 * not a problem when ancestor filters are used during top-down traversal of the
 * DOM, in which case an element is only ever visited once. If used elsewhere
 * care must however be taken when adding and removing elements; elements must
 * only ever be added and removed once, and an element must not be removed
 * before being added.
 *
 * {@link http://doc.servo.org/style/bloom/struct.StyleBloom.html}
 *
 * @internal
 */
export class AncestorFilter implements Serializable<AncestorFilter.JSON> {
  public static empty(): AncestorFilter {
    return new AncestorFilter();
  }

  private readonly _ids = Bucket.empty();
  private readonly _classes = Bucket.empty();
  private readonly _types = Bucket.empty();

  private constructor() {}

  public add(element: Element): void {
    for (const id of element.id) {
      this._ids.add(id);
    }

    this._types.add(element.name);

    for (const className of element.classes) {
      this._classes.add(className);
    }
  }

  public remove(element: Element): void {
    for (const id of element.id) {
      this._ids.remove(id);
    }

    this._types.remove(element.name);

    for (const className of element.classes) {
      this._classes.remove(className);
    }
  }

  public matches(selector: Selector): boolean {
    if (Id.isId(selector)) {
      return this._ids.has(selector.name);
    }

    if (Class.isClass(selector)) {
      return this._classes.has(selector.name);
    }

    if (Type.isType(selector)) {
      return this._types.has(selector.name);
    }

    return false;
  }

  public toJSON(): AncestorFilter.JSON {
    return {
      ids: this._ids.toJSON(),
      classes: this._classes.toJSON(),
      types: this._types.toJSON(),
    };
  }
}

/**
 * @internal
 */
export namespace AncestorFilter {
  export interface JSON {
    [key: string]: json.JSON;
    ids: Bucket.JSON;
    classes: Bucket.JSON;
    types: Bucket.JSON;
  }
}

/**
 * An ancestor bucket stores entries with associated counts in order to keep
 * track of how many elements are associated with the entry. When the number of
 * elements associated with a given entry drops to zero then the entry can be
 * removed from the bucket.
 *
 * While most browser implementations use bloom filters for ancestor filters, we
 * can make do with native maps for two reasons: Memory is not much of a concern
 * as we only ever compute cascade once for every context, and native maps are
 * actually much faster than any bloom filter we might be able to cook up in
 * plain JavaScript.
 *
 * @internal
 */
export class Bucket implements Serializable<Bucket.JSON> {
  public static empty(): Bucket {
    return new Bucket();
  }

  private readonly _entries = new Map<string, number>();

  private constructor() {}

  public has(entry: string): boolean {
    return this._entries.has(entry);
  }

  public add(entry: string): void {
    const count = this._entries.get(entry);

    if (count === undefined) {
      this._entries.set(entry, 1);
    } else {
      this._entries.set(entry, count + 1);
    }
  }

  public remove(entry: string): void {
    const count = this._entries.get(entry);

    if (count === undefined) {
      return;
    }

    if (count === 1) {
      this._entries.delete(entry);
    } else {
      this._entries.set(entry, count - 1);
    }
  }

  public toJSON(): Bucket.JSON {
    return [...this._entries];
  }
}

/**
 * @internal
 */
export namespace Bucket {
  export type JSON = Array<[string, number]>;
}
