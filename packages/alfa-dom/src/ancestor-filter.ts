import {
  SelectorType,
  IdSelector,
  ClassSelector,
  TypeSelector
} from "@siteimprove/alfa-css";
import { Element } from "./types";
import { getId } from "./get-id";
import { getClassList } from "./get-class-list";

/**
 * The ancestor filter is a data structure used for optimising selector matching
 * in the case of descendant selectors. When traversing down through the DOM
 * tree during selector matching, the ancestor filter stores information about
 * the ancestor elements that are found up the path from the element that is
 * currently being visited. Given an element and a descendant selector, we can
 * therefore quickly determine if the selector might match an ancestor of the
 * current element.
 *
 * The information stored about elements includes their ID, classes, and type
 * which are what the majority of selectors make use of. A bucket exists for
 * each of these and whenever an element is added to the filter, its associated
 * ID, classes, and type are added to the three buckets. The buckets also keep
 * count of how many elements in the current path match a given ID, class, or
 * type, in order to evict these from the filter when the last element with a
 * given ID, class, or type is removed from the filter.
 *
 * For example, consider the following tree:
 *
 * section#content
 * +-- blockquote
 * +-- p.highlight
 *     +-- b
 *
 * If we assume that we're currently visiting the `<b>` element, the ancestor
 * ancestor filter would contain the `section` and `p` types, the `#content` ID,
 * and the `.highlight` class. Given a selector `main b`, we can therefore
 * reject that the selector would match `<b>` as the ancestor filter does not
 * contain an entry for the type `main`.
 *
 * NB: None of the operations of the ancestor filter are idempontent to avoid
 * keeping track of more information than strictly necessary. This is however
 * not a problem when ancestor filters are used during top-down traversal of the
 * DOM, in which case an element is only ever visited once. If used elsewhere
 * care must however be taken when adding and removing elements; elements must
 * only ever be added and removed once, and an element must not be removed
 * before being added.
 *
 * @see http://doc.servo.org/style/bloom/struct.StyleBloom.html
 *
 * @internal
 */
export class AncestorFilter {
  private readonly ids: AncestorBucket = new Map();
  private readonly classes: AncestorBucket = new Map();
  private readonly types: AncestorBucket = new Map();

  public add(element: Element): void {
    this.process(element, addEntry);
  }

  public remove(element: Element): void {
    this.process(element, removeEntry);
  }

  public matches(selector: IdSelector | ClassSelector | TypeSelector): boolean {
    const { name } = selector;

    switch (selector.type) {
      case SelectorType.IdSelector:
        return this.ids.has(name);

      case SelectorType.ClassSelector:
        return this.classes.has(name);

      case SelectorType.TypeSelector:
        return this.types.has(name);
    }
  }

  private process(
    element: Element,
    fn: (bucket: AncestorBucket, entry: string) => void
  ): void {
    // Elements with no child nodes are not relevant for ancestor filtering so
    // we can bail out early.
    if (element.childNodes.length === 0) {
      return;
    }

    const id = getId(element);

    if (id !== null) {
      fn(this.ids, id);
    }

    fn(this.types, element.localName);

    const classList = getClassList(element);

    for (let i = 0, n = classList.length; i < n; i++) {
      fn(this.classes, classList[i]);
    }
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
