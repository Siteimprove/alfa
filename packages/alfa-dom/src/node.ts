import { Equatable } from "@siteimprove/alfa-equatable";
import { Lazy } from "@siteimprove/alfa-lazy";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

const { equals } = Predicate;

export abstract class Node
  implements Iterable<Node>, Equatable, json.Serializable, earl.Serializable {
  protected readonly _children: Array<Node>;
  protected _parent: Option<Node> = None;

  /**
   * Whether or not the node is frozen.
   *
   * @remarks
   * As nodes are initialized without a parent and possibly attached to a parent
   * after construction, this makes hierarchies of nodes mutable. That is, a
   * node without a parent node may be assigned one by being passed as a child
   * to a parent node. When this happens, a node becomes frozen. Nodes can also
   * become frozen before being assigned a parent by using the `Node#freeze()`
   * method.
   */
  protected _frozen: boolean = false;

  protected constructor(children: Array<Node>) {
    this._children = children.filter((child) => child._attachParent(this));
  }

  public get frozen(): boolean {
    return this._frozen;
  }

  /**
   * Freeze the node. This prevents further expansion of the node hierarchy,
   * meaning that the node can no longer be passed as a child to a parent node.
   */
  public freeze(): this {
    this._frozen = this._frozen || true;
    return this;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-parent
   */
  public parent(_: Node.Traversal = {}): Option<Node> {
    return this._parent;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-root
   */
  public root(options: Node.Traversal = {}): Node {
    for (const parent of this.parent(options)) {
      return parent.root(options);
    }

    return this;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-child
   */
  public children(_: Node.Traversal = {}): Sequence<Node> {
    return Sequence.from(this._children);
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-descendant
   */
  public descendants(options: Node.Traversal = {}): Sequence<Node> {
    return this.children(options).flatMap((child) =>
      Sequence.of(
        child,
        Lazy.of(() => child.descendants(options))
      )
    );
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant
   */
  public inclusiveDescendants(options: Node.Traversal = {}): Sequence<Node> {
    return Sequence.of(
      this,
      Lazy.of(() => this.descendants(options))
    );
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-ancestor
   */
  public ancestors(options: Node.Traversal = {}): Sequence<Node> {
    for (const parent of this.parent(options)) {
      return Sequence.of(
        parent,
        Lazy.of(() => parent.ancestors(options))
      );
    }

    return Sequence.empty();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor
   */
  public inclusiveAncestors(options: Node.Traversal = {}): Sequence<Node> {
    return Sequence.of(
      this,
      Lazy.of(() => this.ancestors(options))
    );
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-sibling
   */
  public siblings(options: Node.Traversal = {}): Sequence<Node> {
    return this.inclusiveSiblings(options).reject(equals(this));
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-inclusive-sibling
   */
  public inclusiveSiblings(options: Node.Traversal = {}): Sequence<Node> {
    for (const parent of this.parent(options)) {
      return parent.children(options);
    }

    return Sequence.empty();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-preceding
   */
  public preceding(options: Node.Traversal = {}): Sequence<Node> {
    return this.inclusiveSiblings(options).takeUntil(equals(this)).reverse();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-following
   */
  public following(options: Node.Traversal = {}): Sequence<Node> {
    return this.inclusiveSiblings(options).skipUntil(equals(this)).rest();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-first-child
   */
  public first(options: Node.Traversal = {}): Option<Node> {
    return this.children(options).first();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-last-child
   */
  public last(options: Node.Traversal = {}): Option<Node> {
    return this.children(options).last();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-previous-sibling
   */
  public previous(options: Node.Traversal = {}): Option<Node> {
    return this.preceding(options).first();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-next-sibling
   */
  public next(options: Node.Traversal = {}): Option<Node> {
    return this.following(options).first();
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-index
   */
  public index(options: Node.Traversal = {}): number {
    return this.preceding(options).size;
  }

  /**
   * @see https://dom.spec.whatwg.org/#dom-element-closest
   */
  public closest<T extends Node>(
    refinement: Refinement<Node, T>,
    options?: Node.Traversal
  ): Option<T>;

  /**
   * @see https://dom.spec.whatwg.org/#dom-element-closest
   */
  public closest(
    predicate: Predicate<Node>,
    options?: Node.Traversal
  ): Option<Node>;

  /**
   * @see https://dom.spec.whatwg.org/#dom-element-closest
   */
  public closest(
    predicate: Predicate<Node>,
    options: Node.Traversal = {}
  ): Option<Node> {
    return this.inclusiveAncestors(options).find(predicate);
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-descendant-text-content
   */
  public textContent(options: Node.Traversal = {}): string {
    return this.descendants(options).filter(Text.isText).join("");
  }

  /**
   * Construct a sequence of descendants of this node sorted by tab index. Only
   * nodes with a non-negative tab index are included in the sequence.
   *
   * @see https://html.spec.whatwg.org/#tabindex-value
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
            Element.isElement
          );
        }

        if (tabIndex.some((i) => i >= 0)) {
          return Sequence.of(
            element,
            Lazy.of(() => element.children().flatMap(candidates))
          );
        }
      }

      return node.children().flatMap(candidates);
    };

    return candidates(this)
      .sortWith((a, b) =>
        a
          .tabIndex()
          .compareWith(b.tabIndex(), (a, b) => (a < b ? -1 : a > b ? 1 : 0))
      )
      .flatMap((element) => {
        const tabIndex = element.tabIndex();

        for (const shadow of element.shadow) {
          if (tabIndex.some((i) => i >= 0)) {
            return Sequence.of(
              element,
              Lazy.of(() => shadow.tabOrder())
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

  /**
   * Get an XPath that uniquely identifies the node across descendants of its
   * root.
   */
  public path(options?: Node.Traversal): string {
    let path = this.parent(options)
      .map((parent) => parent.path(options))
      .getOr("/");

    path += path === "/" ? "" : "/";
    path += "node()";
    path += `[${this.index(options) + 1}]`;

    return path;
  }

  public *[Symbol.iterator](): Iterator<Node> {
    yield* this.descendants();
  }

  public equals(value: unknown): value is this {
    return value === this;
  }

  public abstract toJSON(): Node.JSON;

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

  /**
   * @internal
   */
  public _attachParent(parent: Node): boolean {
    if (this._frozen || this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

export namespace Node {
  export function isNode(value: unknown): value is Node {
    return value instanceof Node;
  }

  export interface Traversal {
    /**
     * When `true`, traverse the node in shadow-including tree order.
     *
     * @see https://dom.spec.whatwg.org/#concept-shadow-including-tree-order
     */
    readonly composed?: boolean;

    /**
     * When `true`, traverse the flattened element tree rooted at the node.
     *
     * @see https://drafts.csswg.org/css-scoping/#flat-tree
     */
    readonly flattened?: boolean;

    /**
     * When `true`, traverse all nested browsing contexts encountered.
     *
     * @see https://html.spec.whatwg.org/#nested-browsing-context
     */
    readonly nested?: boolean;
  }
}

import { Attribute } from "./node/attribute";
import { Comment } from "./node/comment";
import { Document } from "./node/document";
import { Element } from "./node/element";
import { Fragment } from "./node/fragment";
import { Text } from "./node/text";
import { Type } from "./node/type";
import { Slot } from "./node/slot";

export namespace Node {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
  }

  export function from(json: Element.JSON): Element;

  export function from(json: Attribute.JSON): Attribute;

  export function from(json: Text.JSON): Text;

  export function from(json: Comment.JSON): Comment;

  export function from(json: Document.JSON): Document;

  export function from(json: Type.JSON): Document;

  export function from(json: Fragment.JSON): Fragment;

  export function from(json: JSON): Node;

  export function from(json: JSON): Node {
    return fromNode(json).run();
  }

  /**
   * @internal
   */
  export function fromNode(json: JSON): Trampoline<Node> {
    switch (json.type) {
      case "element":
        return Element.fromElement(json as Element.JSON);

      case "attribute":
        return Attribute.fromAttribute(json as Attribute.JSON);

      case "text":
        return Text.fromText(json as Text.JSON);

      case "comment":
        return Comment.fromComment(json as Comment.JSON);

      case "document":
        return Document.fromDocument(json as Document.JSON);

      case "type":
        return Type.fromType(json as Type.JSON);

      case "fragment":
        return Fragment.fromFragment(json as Fragment.JSON);

      default:
        throw new Error(`Unexpected node of type: ${json.type}`);
    }
  }

  export interface EARL extends earl.EARL {
    "@context": {
      ptr: "http://www.w3.org/2009/pointers#";
    };
    "@type": [
      "ptr:Pointer",
      "ptr:SinglePointer",
      "ptr:ExpressionPointer",
      "ptr:XPathPointer"
    ];
    "ptr:expression": string;
    "ptr:reference"?: {
      "@id": string;
    };
  }
}
