import {
  Comparable,
  type Comparer,
  Comparison,
} from "@siteimprove/alfa-comparable";
import type { Device } from "@siteimprove/alfa-device";
import { Flags } from "@siteimprove/alfa-flags";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { String } from "@siteimprove/alfa-string";

import type * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import type * as sarif from "@siteimprove/alfa-sarif";
import * as tree from "@siteimprove/alfa-tree";

import type { Element, Node, Shadow, Slotable, Text } from "./index.js";
import type { Slot } from "./slotable/slot.js";

/**
 * @public
 */
export abstract class BaseNode<T extends string = string>
  extends tree.Node<"DOM traversal", BaseNode.TraversalFlags, T>
  implements
    earl.Serializable<BaseNode.EARL>,
    json.Serializable<tree.Node.JSON<T>>,
    sarif.Serializable<sarif.Location>
{
  protected constructor(
    children: Array<Node>,
    type: T,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ) {
    super(children, type, externalId, internalId, extraData);
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-descendant-text-content}
   */
  public textContent(
    options: BaseNode.Traversal = BaseNode.Traversal.empty,
  ): string {
    return String.flatten(this.descendants(options).filter(isText).join(""));
  }

  /**
   * Construct a sequence of descendants of this node sorted by tab index. Only
   * nodes with a non-negative tab index are included in the sequence.
   *
   * {@link https://html.spec.whatwg.org/multipage/#tabindex-value}
   */
  public tabOrder(this: Node): Sequence<Element> {
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
      if (isElement(node)) {
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
        if (isSlot(element)) {
          return Sequence.from(element.assignedNodes())
            .filter(isElement)
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
     * It is important that this expansion happens **after** sorting by
     *   tabindex
     * since shadow DOM and content documents build their own sequential focus
     * order that is inserted as-is in the light tree or parent browsing
     *   context. That is, a tabindex of 1 in a shadow tree or content document
     *   does
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

  /**
   * @privateRemarks
   * The type assertions to `Node` in here are technically incorrect.
   * BaseNode could be extended to another class which is then not added to the
   * Node union, in which case the assertions would be wrong. This scenario is
   * however quite unlikely given that BaseNode is not exported out of this
   * package. So it is only a matter of us not doing so, which sound OK enough.
   * It is not possible at this level to do any sort of runtime type checking
   * without creating circular dependencies, and the parent method here has
   * to extends the one in `alfa-tree/Node`.
   */
  public parent(
    options: BaseNode.Traversal = BaseNode.Traversal.empty,
  ): Option<Node> {
    const parent = this._parent as Option<Node>;

    // If we traverse the flat tree, we want to jump over shadow roots.
    if (options.isSet(BaseNode.Traversal.flattened)) {
      return parent.flatMap((parent) => {
        if (isShadow(parent)) {
          return parent.host;
        }

        // Additionally, if this is a slottable light child of a shadow host, we want
        // to search for where it is slotted, and return that parent instead.
        if (
          isElement(parent) &&
          parent.shadow.isSome() &&
          isSlotable(this as unknown as Node)
        ) {
          return (this as unknown as Slotable)
            .assignedSlot()
            .flatMap((slot) => slot.parent(options));
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
  protected _internalPath(options?: BaseNode.Traversal): string {
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
  public path(options: BaseNode.Traversal = BaseNode.Traversal.empty): string {
    if (this._path[options.value] == undefined) {
      this._path[options.value] = this._internalPath(options);
    }

    return this._path[options.value];
  }

  public equals(value: BaseNode): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public toJSON(options?: Serializable.Options): BaseNode.JSON<T> {
    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    // `super.toJSON` types the children as tree.Node.JSON, but we know they
    // are generated by applying `#toJSON` on each child, and children are
    // here forced to be Node.
    const base = super.toJSON(options) as tree.Node.JSON<T> & {
      children?: Array<Node.JSON>;
    };

    return {
      ...base,
      ...(json.Serializable.Verbosity.Minimal < verbosity &&
      verbosity < json.Serializable.Verbosity.Medium
        ? { path: this.path(BaseNode.composedNested) }
        : {}),
    };
  }

  public toEARL(): BaseNode.EARL {
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
export interface BaseNode {
  // Overriding type of tree traversal functions; due to constructor signature
  // we cannot mix in other kind of nodes.
  parent(options?: BaseNode.Traversal): Option<Node>;
  isParentOf(node: Node, options?: BaseNode.Traversal): boolean;
  root(options?: BaseNode.Traversal): Node;
  isRootOf(node: Node, options?: BaseNode.Traversal): boolean;
  children(options?: BaseNode.Traversal): Sequence<Node>;
  isChildOf(node: Node, options?: BaseNode.Traversal): boolean;
  descendants(options?: BaseNode.Traversal): Sequence<Node>;
  isDescendantOf(node: Node, options?: BaseNode.Traversal): boolean;
  inclusiveDescendants(options?: BaseNode.Traversal): Sequence<Node>;
  isInclusiveDescendantsOf(node: Node, options?: BaseNode.Traversal): boolean;
  ancestors(options?: BaseNode.Traversal): Sequence<Node>;
  isAncestorOf(node: Node, options?: BaseNode.Traversal): boolean;
  inclusiveAncestors(options?: BaseNode.Traversal): Sequence<Node>;
  isInclusiveAncestorOf(node: Node, options?: BaseNode.Traversal): boolean;
  siblings(options?: BaseNode.Traversal): Sequence<Node>;
  isSiblingOf(node: Node, options?: BaseNode.Traversal): boolean;
  inclusiveSiblings(options?: BaseNode.Traversal): Sequence<Node>;
  isInclusiveSiblingOf(node: Node, options?: BaseNode.Traversal): boolean;
  preceding(options?: BaseNode.Traversal): Sequence<Node>;
  following(options?: BaseNode.Traversal): Sequence<Node>;
  first(options?: BaseNode.Traversal): Option<Node>;
  last(options?: BaseNode.Traversal): Option<Node>;
  previous(options?: BaseNode.Traversal): Option<Node>;
  next(options?: BaseNode.Traversal): Option<Node>;
  index(options?: BaseNode.Traversal, predicate?: Predicate<Node>): number;
  closest<T extends Node>(
    refinement: Refinement<Node, T>,
    options?: BaseNode.Traversal,
  ): Option<T>;
  closest(
    predicate: Predicate<Node>,
    options?: BaseNode.Traversal,
  ): Option<Node>;
}

/**
 * @public
 */
export namespace BaseNode {
  export interface JSON<T extends string = string> extends tree.Node.JSON<T> {
    path?: string;
    children?: Array<Node.JSON>;
  }

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

  export const Traversal = Flags.named(
    "DOM traversal",
    "composed",
    "flattened",
    "nested",
  );
  export type Traversal = ReturnType<(typeof Traversal)["of"]>;
  export type TraversalFlags = (typeof BaseNode.Traversal.allFlags)[number];

  /**
   * Traversal options to traverse the flat tree.
   *
   * {@link https://drafts.csswg.org/css-scoping-1/#flattening}
   */
  export const flatTree = Traversal.of("flattened");

  /**
   * Traversal options to traverse all relevant nodes (flat tree and inside
   * nested browsing container), a very frequent use case.
   */
  export const fullTree = Traversal.of("flattened", "nested");

  /**
   * Traversal options to traverse in shadow-including tree order and inside
   * nested browsing context container, a common use case.
   */
  export const composedNested = Traversal.of("composed", "nested");
}

/*
 * Sub-nodes type guards, we need to duplicate them to avoid circular references.
 * Here, we only use the differentiating `type` property.
 */
function isElement(node: Node): node is Element {
  return node.type === "element";
}

function isSlot(element: Element): element is Slot {
  return element.name === "slot";
}

function isShadow(node: Node): node is Shadow {
  return node.type === "shadow";
}

function isSlotable(node: Node): node is Slotable {
  return isElement(node) || isText(node);
}

function isText(node: Node): node is Text {
  return node.type === "text";
}
