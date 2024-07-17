import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import type { Device } from "@siteimprove/alfa-device";
import { Flags } from "@siteimprove/alfa-flags";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Selective } from "@siteimprove/alfa-selective";
import { Sequence } from "@siteimprove/alfa-sequence";
import { String } from "@siteimprove/alfa-string";
import type { Trampoline } from "@siteimprove/alfa-trampoline";

import type * as earl from "@siteimprove/alfa-earl";
import type * as json from "@siteimprove/alfa-json";
import type * as sarif from "@siteimprove/alfa-sarif";
import * as tree from "@siteimprove/alfa-tree";

import {
  Attribute,
  Comment,
  Document,
  Element,
  Fragment,
  Shadow,
  Slot,
  Slotable,
  Text,
  Type,
} from "./index.js";

import * as predicate from "./node/predicate.js";
import * as traversal from "./node/traversal.js";

/**
 * @public
 */
export abstract class Node<T extends string = string>
  extends tree.Node<Node.Traversal.Flag, T>
  implements
    earl.Serializable<Node.EARL>,
    json.Serializable<tree.Node.JSON<T>>,
    sarif.Serializable<sarif.Location>
{
  protected constructor(
    children: Array<Node>,
    type: T,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super(children, type, externalId, serializationId, extraData);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-descendant-text-content}
   */
  public textContent(options: Node.Traversal = Node.Traversal.empty): string {
    return String.flatten(
      this.descendants(options).filter(Text.isText).join(""),
    );
  }

  /**
   * Construct a sequence of descendants of this node sorted by tab index. Only
   * nodes with a non-negative tab index are included in the sequence.
   *
   * {@link https://html.spec.whatwg.org/multipage/#tabindex-value}
   */
  public tabOrder(): Sequence<Element> {
    /**
     * Gather candidates for sequential focus navigation.
     *
     * @remarks
     * These are all elements that are keyboard focusable (non-negative
     * tabIndex), plus the shadow hosts and content elements that may contain
     * focusable descendants.
     *
     * It is important that the traversal is done here on the DOM tree only.
     * The shadow trees and content documents will be expanded later. Doing it
     * too early potentially would mix their elements during sorting of the
     * tabIndexes.
     */
    function candidates(node: Node): Sequence<[Element, Option<number>]> {
      if (Element.isElement(node)) {
        const element = node;

        const tabIndex = element.tabIndex();

        // If the element is a shadow host that doesn't block keyboard navigation
        // we record it to later expand its shadow tree.
        if (element.shadow.isSome()) {
          // If the element has a negative tab index and is a shadow host then
          // none of its descendants will be part of the tab order.
          if (tabIndex.some((i) => i < 0)) {
            return Sequence.empty();
          } else {
            return Sequence.of([element, tabIndex]);
          }
        }

        // If the element contains a content document, we record it to later
        // expand its content.
        if (element.content.isSome()) {
          return Sequence.of([element, tabIndex]);
        }

        // If the element is a slot, we replace it by its assigned nodes.
        if (Slot.isSlot(element)) {
          return Sequence.from(element.assignedNodes())
            .filter(Element.isElement)
            .map((element) => [element, tabIndex]);
        }

        // If the element is keyboard focusable, record it and recurse.
        if (tabIndex.some((i) => i >= 0)) {
          return Sequence.of(
            [element, tabIndex],
            Lazy.of(() => element.children().flatMap(candidates)),
          );
        }
      }

      // Otherwise (not an element, or not keyboard focusable), recurse into the children.
      return node.children().flatMap(candidates);
    }

    /**
     * Compare two elements, with non-negative tabindexes, by tabindex.
     *
     * @remarks
     * Due to non-focusable shadow hosts being candidates (for shadow DOM
     * expansion), we may have some indexes being None. These must be treated
     * as 0 (insert in DOM order), rather than smaller than actual indexes
     * (insert at start). Therefore, we cannot use Option.compareWith.
     */
    const comparer: Comparer<[Element, Option<number>]> = ([, a], [, b]) => {
      const aValue = a.getOr(0);
      const bValue = b.getOr(0);

      return aValue === 0
        ? // "normal order" must come after any "specific order",
          // i.e., 0 is greater than any positive number.
          bValue === 0
          ? Comparison.Equal
          : Comparison.Greater
        : bValue === 0
          ? // aValue cannot be 0 anymore.
            Comparison.Less
          : // If none are 0, simply compare the values.
            Comparable.compare(aValue, bValue);
    };

    /**
     * Expand an element into the sequentially focusable elements in its
     * shadow tree or content document.
     *
     * @remarks
     * It is important that this expansion happens **after** sorting by tabindex
     * since shadow DOM and content documents build their own sequential focus
     * order that is inserted as-is in the light tree or parent browsing context.
     * That is, a tabindex of 1 in a shadow tree or content document does
     * **not** come before a tabindex of 2 in the main document.
     */
    function expand([element, tabIndex]: [
      Element,
      Option<number>,
    ]): Sequence<Element> {
      // In case of shadow host, we include it if its sequentially focusable,
      // and always recurse into the shadow tree.
      for (const shadow of element.shadow) {
        if (tabIndex.some((i) => i >= 0)) {
          return Sequence.of(
            element,
            Lazy.of(() => shadow.tabOrder()),
          );
        } else {
          return shadow.tabOrder();
        }
      }

      // In case of content document, we always ignore the host (iframe) which
      // usually redirects focus to the content.
      for (const content of element.content) {
        return content.tabOrder();
      }

      // If no shadow or content document, just keep the element.
      return Sequence.of(element);
    }

    return candidates(this).sortWith(comparer).flatMap(expand);
  }

  public parent(options: Node.Traversal = Node.Traversal.empty): Option<Node> {
    const parent = this._parent as Option<Node>;

    // If we traverse the flat tree, we want to jump over shadow roots.
    if (options.isSet(Node.Traversal.flattened)) {
      return parent.flatMap((parent) => {
        if (Shadow.isShadow(parent)) {
          return parent.host;
        }

        // Additionally, if this is a slottable light child of a shadow host, we want
        // to search for where it is slotted, and return that parent instead.
        if (
          Element.isElement(parent) &&
          parent.shadow.isSome() &&
          Slotable.isSlotable(this)
        ) {
          return this.assignedSlot().flatMap((slot) => slot.parent(options));
        }

        return Option.of(parent);
      });
    }

    return parent;
  }

  private _path: Array<string> = [];

  /**
   * @internal
   */
  protected _internalPath(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "node()";
    path += `[${this.index(options) + 1}]`;

    return path;
  }

  /**
   * Get an XPath that uniquely identifies the node across descendants of its
   * root.
   */
  // path may change if the subtree is attached to a parent, so we shouldn't
  // cache it.
  // However, path is a fairly "final" serialisation operation that makes
  // little sense in the context of an incomplete tree.
  // For the sake of simplicity, and until we encounter errors due to this,
  // we accept the risk of caching the value assuming that it will only be
  // computed on fully frozen trees.
  public path(options: Node.Traversal = Node.Traversal.empty): string {
    if (this._path[options.value] !== undefined) {
      return this._path[options.value];
    } else {
      this._path[options.value] = this._internalPath(options);

      return this._internalPath(options);
    }
  }

  public equals(value: Node): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public toEARL(): Node.EARL {
    return {
      "@context": {
        ptr: "http://www.w3.org/2009/pointers#",
      },
      "@type": [
        "ptr:Pointer",
        "ptr:SinglePointer",
        "ptr:ExpressionPointer",
        "ptr:XPathPointer",
      ],
      "ptr:expression": this.path(),
    };
  }

  public toSARIF(): sarif.Location {
    return {
      logicalLocations: [
        {
          fullyQualifiedName: this.path(),
        },
      ],
    };
  }
}

/**
 * @public
 */
export interface Node {
  // Overriding type of tree traversal functions; due to constructor signature
  // we cannot mix in other kind of nodes.
  parent(options?: Node.Traversal): Option<Node>;
  isParentOf(node: Node, options?: Node.Traversal): boolean;
  root(options?: Node.Traversal): Node;
  isRootOf(node: Node, options?: Node.Traversal): boolean;
  children(options?: Node.Traversal): Sequence<Node>;
  isChildOf(node: Node, options?: Node.Traversal): boolean;
  descendants(options?: Node.Traversal): Sequence<Node>;
  isDescendantOf(node: Node, options?: Node.Traversal): boolean;
  inclusiveDescendants(options?: Node.Traversal): Sequence<Node>;
  isInclusiveDescendantsOf(node: Node, options?: Node.Traversal): boolean;
  ancestors(options?: Node.Traversal): Sequence<Node>;
  isAncestorOf(node: Node, options?: Node.Traversal): boolean;
  inclusiveAncestors(options?: Node.Traversal): Sequence<Node>;
  isInclusiveAncestorOf(node: Node, options?: Node.Traversal): boolean;
  siblings(options?: Node.Traversal): Sequence<Node>;
  isSiblingOf(node: Node, options?: Node.Traversal): boolean;
  inclusiveSiblings(options?: Node.Traversal): Sequence<Node>;
  isInclusiveSiblingOf(node: Node, options?: Node.Traversal): boolean;
  preceding(options?: Node.Traversal): Sequence<Node>;
  following(options?: Node.Traversal): Sequence<Node>;
  first(options?: Node.Traversal): Option<Node>;
  last(options?: Node.Traversal): Option<Node>;
  previous(options?: Node.Traversal): Option<Node>;
  next(options?: Node.Traversal): Option<Node>;
  index(options?: Node.Traversal): number;
  closest<T extends Node>(
    refinement: Refinement<Node, T>,
    options?: Node.Traversal,
  ): Option<T>;
  closest(predicate: Predicate<Node>, options?: Node.Traversal): Option<Node>;
}

/**
 * @public
 */
export namespace Node {
  export interface JSON<T extends string = string> extends tree.Node.JSON<T> {}

  export interface SerializationOptions extends json.Serializable.Options {
    device?: Device;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      ptr: "http://www.w3.org/2009/pointers#";
    };
    "@type": [
      "ptr:Pointer",
      "ptr:SinglePointer",
      "ptr:ExpressionPointer",
      "ptr:XPathPointer",
    ];
    "ptr:expression": string;
    "ptr:reference"?: {
      "@id": string;
    };
  }

  export function isNode(value: unknown): value is Node {
    return value instanceof Node;
  }

  export class Traversal extends Flags<Traversal.Flag> {
    public static of(...flags: Array<Traversal.Flag>): Traversal {
      return new Traversal(Flags._reduce(...flags));
    }
  }

  export namespace Traversal {
    export type Flag = 0 | 1 | 2 | 4;

    export const none = 0 as Flag;
    /**
     * When set, traverse the node in shadow-including tree order.
     *
     * {@link https://dom.spec.whatwg.org/#concept-shadow-including-tree-order}
     */
    export const composed = (1 << 0) as Flag;

    /**
     * When set, traverse the flattened element tree rooted at the node.
     *
     * {@link https://drafts.csswg.org/css-scoping/#flat-tree}
     */
    export const flattened = (1 << 1) as Flag;

    /**
     * When set, traverse all nested browsing contexts encountered.
     *
     * {@link https://html.spec.whatwg.org/#nested-browsing-context}
     */
    export const nested = (1 << 2) as Flag;

    export const empty = Traversal.of(none);
  }

  /**
   * Traversal options to traverse the flat tree.
   *
   * {@link https://drafts.csswg.org/css-scoping-1/#flattening}
   */
  export const flatTree = Traversal.of(Traversal.flattened);

  /**
   * Traversal options to traverse all relevant nodes (flat tree and inside
   * nested browsing container), a very frequent use case.
   */
  export const fullTree = Traversal.of(Traversal.flattened, Traversal.nested);

  /**
   * Traversal options to traverse in shadow-including tree order and inside
   * nested browsing context container, a common use case.
   */
  export const composedNested = Traversal.of(
    Traversal.composed,
    Traversal.nested,
  );

  export function from(json: Element.JSON, device?: Device): Element;

  export function from(json: Attribute.JSON, device?: Device): Attribute;

  export function from(json: Text.JSON, device?: Device): Text;

  export function from(json: Comment.JSON, device?: Device): Comment;

  export function from(json: Document.JSON, device?: Device): Document;

  export function from(json: Type.JSON, device?: Device): Document;

  export function from(json: Fragment.JSON, device?: Device): Fragment;

  export function from(json: JSON, device?: Device): Node;

  export function from(json: JSON, device?: Device): Node {
    return fromNode(json, device).run();
  }

  /**
   * @internal
   */
  export function fromNode(json: JSON, device?: Device): Trampoline<Node> {
    switch (json.type) {
      case "element":
        return Element.fromElement(json as Element.JSON, device);

      case "attribute":
        return Attribute.fromAttribute(json as Attribute.JSON);

      case "text":
        return Text.fromText(json as Text.JSON);

      case "comment":
        return Comment.fromComment(json as Comment.JSON);

      case "document":
        return Document.fromDocument(json as Document.JSON, device);

      case "type":
        return Type.fromType(json as Type.JSON);

      case "fragment":
        return Fragment.fromFragment(json as Fragment.JSON, device);

      default:
        throw new Error(`Unexpected node of type: ${json.type}`);
    }
  }

  export interface ElementReplacementOptions {
    predicate: Predicate<Element>;
    newElements: Iterable<Element>;
  }

  /**
   * Creates a new `Element` instance with the same value as the original and
   * deeply referentially non-equal. Optionally replaces child elements based
   * on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Element,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Element;

  /**
   * Creates a new `Attribute` instance with the same value as the original and
   * referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Attribute,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Attribute;

  /**
   * Creates a new `Text` instance with the same value as the original and
   * referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Text,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Text;

  /**
   * Creates a new `Comment` instance with the same value as the original and
   * referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Comment,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Comment;

  /**
   * Creates a new `Document` instance with the same value as the original and
   * deeply referentially non-equal. Optionally replaces child elements based
   * on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Document,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Document;

  /**
   * Creates a new `Type` instance with the same value as the original and
   * referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Type,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Document;

  /**
   * Creates a new `Fragment` instance with the same value as the original and
   * deeply referentially non-equal. Optionally replaces child elements based
   * on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Fragment,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Fragment;

  /**
   * Creates a new `Shadow` instance with the same value as the original and
   * deeply referentially non-equal. Optionally replaces child elements based
   * on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   * `undefined`.
   */
  export function clone(
    node: Shadow,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Shadow;

  /**
   * Creates a new `Node` instance with the same value as the original and
   * deeply referentially non-equal. Optionally replaces child elements based
   * on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be
   *   `undefined`.
   */
  export function clone(
    node: Node,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Node;

  export function clone(
    node: Node,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Node {
    return cloneNode(node, options, device).run();
  }

  /**
   * @internal
   */
  export function cloneNode(
    node: Node,
    options: ElementReplacementOptions = {
      predicate: () => false,
      newElements: [],
    },
    device?: Device,
  ): Trampoline<Node> {
    return Selective.of(node)
      .if(Element.isElement, Element.cloneElement(options, device))
      .if(Attribute.isAttribute, Attribute.cloneAttribute)
      .if(Text.isText, Text.cloneText)
      .if(Comment.isComment, Comment.cloneComment)
      .if(Document.isDocument, Document.cloneDocument(options, device))
      .if(Type.isType, Type.cloneType)
      .if(Fragment.isFragment, Fragment.cloneFragment(options, device))
      .if(Shadow.isShadow, Shadow.cloneShadow(options, device))
      .else(() => {
        throw new Error(`Unexpected node of type: ${node.type}`);
      })
      .get();
  }

  export const { getNodesBetween } = traversal;

  export const {
    hasChild,
    hasDescendant,
    hasInclusiveDescendant,
    hasTextContent,
    isRoot,
  } = predicate;
}
