import { Equatable } from "@siteimprove/alfa-equatable";
import { Flags } from "@siteimprove/alfa-flags";
import { None, Option } from "@siteimprove/alfa-option";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

/**
 * Model for n-ary trees with some traversal flags.
 *
 * In order to have a parent pointers, nodes are allowed to attach themselves
 * to a parent node. To prevent mutation of an existing tree, the child is then
 * "frozen".
 *
 * Since it is not possible to add children after node creation, and it is not
 * possible to re-attach an already attached node, this means that the trees are
 * effectively downward frozen. In turn, this allows a bunch of optimisation
 * since any traversal function that does not look upward can be cached.
 *
 * The full tree (all nodes) must accept the same set of traversal flags, but
 * the node type is not constrained.
 *
 * @public
 */
// F: Flags used for traversal
// T: Type of node
export abstract class Node<F extends Flags, T extends string = string>
  implements
    Iterable<Node<F>>,
    Equatable,
    earl.Serializable<Node.EARL>,
    json.Serializable<Node.JSON<T>>,
    sarif.Serializable<sarif.Location>
{
  protected readonly _children: Array<Node<F>>;
  protected _parent: Option<Node<F>> = None;
  protected readonly _type: T;

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

  protected constructor(children: Array<Node<F>>, type: T) {
    this._children = children.filter((child) => child._attachParent(this));
    this._type = type;
  }

  public get type(): T {
    return this._type;
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

  public path(): string {
    return "";
  }

  public descendants(): Array<Node<F>> {
    return [];
  }

  public *[Symbol.iterator](): Iterator<Node<F>> {
    yield* this.descendants();
  }

  public equals(value: Node<F>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value === this;
  }

  public toJSON(): Node.JSON<T> {
    return {
      type: this._type,
    };
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

  /**
   * @internal
   */
  public _attachParent(parent: Node<F>): boolean {
    if (this._frozen || this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

export namespace Node {
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

  export interface JSON<T extends string = string> {
    [key: string]: json.JSON | undefined;
    type: T;
  }

  export function isNode<F extends Flags>(value: unknown): value is Node<F> {
    return value instanceof Node;
  }
}
