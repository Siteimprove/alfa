import { Device } from "@siteimprove/alfa-device";
import { Flags } from "@siteimprove/alfa-flags";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Selective } from "@siteimprove/alfa-selective";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

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
} from ".";

import * as predicate from "./node/predicate";
import * as traversal from "./node/traversal";
import { String } from "@siteimprove/alfa-string";

/**
 * @public
 */
export abstract class Node<T extends string = string>
  extends tree.Node<Node.Traversal.Flag, T>
  implements
    earl.Serializable<Node.EARL>,
    json.Serializable<tree.Node.JSON<T>, Node.SerializationOptions>,
    sarif.Serializable<sarif.Location>
{
  protected constructor(
    children: Array<Node>,
    type: T,
    externalId?: string,
    extraData?: any,
  ) {
    super(children, type, externalId, extraData);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-descendant-text-content}
   */
  public textContent(options: Node.Traversal = Node.Traversal.empty): string {
    return String.flatten(this.descendants(options).filter(Text.isText).join(""));
  }

  /**
   * Construct a sequence of descendants of this node sorted by tab index. Only
   * nodes with a non-negative tab index are included in the sequence.
   *
   * {@link https://html.spec.whatwg.org/#tabindex-value}
   */
  public tabOrder(): Sequence<Element> {
    const candidates = (node: Node): Sequence<Element> => {
      if (Element.isElement(node)) {
        const element = node;

        const tabIndex = element.tabIndex();

        if (element.shadow.isSome()) {
          // If the element has a negative tab index and is a shadow host then
          // none of its descendants will be part of the tab order.
          if (tabIndex.some((i) => i < 0)) {
            return Sequence.empty();
          } else {
            return Sequence.of(element);
          }
        }

        if (element.content.isSome()) {
          return Sequence.of(element);
        }

        if (Slot.isSlot(element)) {
          return Sequence.from(element.assignedNodes()).filter(
            Element.isElement,
          );
        }

        if (tabIndex.some((i) => i >= 0)) {
          return Sequence.of(
            element,
            Lazy.of(() => element.children().flatMap(candidates)),
          );
        }
      }

      return node.children().flatMap(candidates);
    };

    return candidates(this)
      .sortWith((a, b) =>
        a.tabIndex().compareWith(b.tabIndex(), (a, b) => {
          if (a === 0) {
            return b === 0 ? 0 : 1;
          }

          if (b === 0) {
            return -1;
          }

          return a < b ? -1 : a > b ? 1 : 0;
        }),
      )
      .flatMap((element) => {
        const tabIndex = element.tabIndex();

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

        for (const content of element.content) {
          return content.tabOrder();
        }

        return Sequence.of(element);
      });
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

  export interface SerializationOptions {
    device: Device;
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
   * Creates a new `Element` instance with the same value as the original and deeply referentially non-equal.
   * Optionally replaces child elements based on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Element,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Element;

  /**
   * Creates a new `Attribute` instance with the same value as the original and referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Attribute,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Attribute;

  /**
   * Creates a new `Text` instance with the same value as the original and referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Text,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Text;

  /**
   * Creates a new `Comment` instance with the same value as the original and referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Comment,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Comment;

  /**
   * Creates a new `Document` instance with the same value as the original and deeply referentially non-equal.
   * Optionally replaces child elements based on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Document,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Document;

  /**
   * Creates a new `Type` instance with the same value as the original and referentially non-equal.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Type,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Document;

  /**
   * Creates a new `Fragment` instance with the same value as the original and deeply referentially non-equal.
   * Optionally replaces child elements based on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Fragment,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Fragment;

  /**
   * Creates a new `Shadow` instance with the same value as the original and deeply referentially non-equal.
   * Optionally replaces child elements based on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
   */
  export function clone(
    node: Shadow,
    options?: ElementReplacementOptions,
    device?: Device,
  ): Shadow;

  /**
   * Creates a new `Node` instance with the same value as the original and deeply referentially non-equal.
   * Optionally replaces child elements based on a predicate.
   *
   * @remarks
   * The clone will have the same `externalId` as the original.
   * The clone will *not* get `extraData` from the original, instead it will be `undefined`.
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
