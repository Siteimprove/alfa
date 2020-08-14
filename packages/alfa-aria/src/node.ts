import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import * as dom from "@siteimprove/alfa-dom";
import * as json from "@siteimprove/alfa-json";

import { Attribute } from "./attribute";
import { Name } from "./name";
import { Role } from "./role";
import { Feature } from "./feature";

import * as predicate from "./node/predicate";

const { and, not, nor, equals } = Predicate;

/**
 * @see https://w3c.github.io/aria/#accessibility_tree
 */
export abstract class Node implements Serializable {
  protected readonly _node: dom.Node;
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

  protected constructor(owner: dom.Node, children: Array<Node>) {
    this._node = owner;
    this._children = children
      .map((child) => (child._frozen ? child.clone() : child))
      .filter((child) => child._attachParent(this));
  }

  public get node(): dom.Node {
    return this._node;
  }

  public get name(): Option<Name> {
    return None;
  }

  public get role(): Option<Role> {
    return None;
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

  public attribute<N extends Attribute.Name>(
    predicate: N | Predicate<Attribute, Attribute<N>>
  ): Option<Attribute<N>> {
    return None;
  }

  /**
   * @see https://dom.spec.whatwg.org/#concept-tree-parent
   */
  public parent(options: Node.Traversal = {}): Option<Node> {
    const parent = this._parent;

    if (options.ignored === true) {
      return parent;
    }

    return parent.flatMap((parent) =>
      parent.isIgnored() ? parent.parent(options) : Option.of(parent)
    );
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
  public children(options: Node.Traversal = {}): Sequence<Node> {
    const children = Sequence.from(this._children);

    if (options.ignored === true) {
      return children;
    }

    return children.flatMap((child) =>
      child.isIgnored() ? child.children(options) : Sequence.of(child)
    );
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
    return this.parent(options)
      .map((parent) =>
        Sequence.of(
          parent,
          Lazy.of(() => parent.ancestors(options))
        )
      )
      .getOrElse(() => Sequence.empty());
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

  public abstract clone(parent?: Option<Node>): Node;

  public abstract isIgnored(): boolean;

  public abstract toJSON(): Node.JSON;

  /**
   * @internal
   */
  public _attachParent(parent: Node): boolean {
    if (this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);
    this._frozen = true;

    return true;
  }
}

import { Container } from "./node/container";
import { Element } from "./node/element";
import { Inert } from "./node/inert";
import { Text } from "./node/text";

export namespace Node {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
    children: Array<JSON>;
  }

  export interface Traversal {
    /**
     * When `true`, traverse both exposed and ignored nodes.
     */
    readonly ignored?: boolean;
  }

  const cache = Cache.empty<Device, Cache<dom.Node, Branched<Node, Browser>>>();

  export function from(
    node: dom.Node,
    device: Device
  ): Branched<Node, Browser> {
    const _cache = cache.get(device, Cache.empty);

    if (_cache.has(node)) {
      return _cache.get(node).get();
    }

    const root = node.root({ flattened: true });

    build(root, device);

    if (_cache.has(node)) {
      return _cache.get(node).get();
    }

    return Branched.of(Inert.of(node));
  }

  function build(node: dom.Node, device: Device): Branched<Node, Browser> {
    return cache.get(device, Cache.empty).get(node, () =>
      Branched.traverse(node.children({ flattened: true }), (child) =>
        build(child, device)
      ).flatMap((children) => {
        // Text nodes are _always_ exposed in the accessibility tree.
        if (dom.Text.isText(node)) {
          return Name.from(node, device).map((name) =>
            Text.of(node, name.get())
          );
        }

        // Element nodes are _sometimes_ exposed in the accessibility tree.
        if (dom.Element.isElement(node)) {
          // Elements that are explicitly excluded from the accessibility tree
          // by means of `aria-hidden=true` are never exposed in the
          // accessibility tree, nor are their descendants.
          //
          // This behaviour is unfortunately not consistent across browsers,
          // which we may or may not want to deal with. For now, we pretend that
          // all browsers act consistently.
          //
          // https://github.com/Siteimprove/alfa/issues/184#issuecomment-593878009
          if (
            node
              .attribute("aria-hidden")
              .some((attribute) =>
                attribute.enumerate("true", "false").some(equals("true"))
              )
          ) {
            return Branched.of(Inert.of(node));
          }

          const style = Style.from(node, device);

          // Elements that are not rendered at all by means of `display: none`
          // are never exposed in the accessibility tree, nor are their
          // descendants.
          //
          // As we're building the accessibility tree top-down, we only need to
          // check the element itself for `display: none` and can safely
          // disregard its ancestors as they will already have been checked.
          if (style.computed("display").value[0].value === "none") {
            return Branched.of(Inert.of(node));
          }

          // Elements that are not visible by means of `visibility: hidden` or
          // `visibility: collapse`, are exposed in the accessibility tree as
          // containers as they may contain visible descendants.
          if (style.computed("visibility").value.value !== "visible") {
            return Branched.of(Container.of(node, children));
          }

          return Role.from(node).flatMap<Node>((role) => {
            if (role.some((role) => role.isPresentational())) {
              return Branched.of(Container.of(node, children));
            }

            let attributes = Map.empty<Attribute.Name, Attribute>();

            // First pass: Look up implicit attributes on the role.
            if (role.isSome()) {
              for (const attribute of role.get().attributes) {
                for (const value of role
                  .get()
                  .implicitAttributeValue(attribute)) {
                  attributes = attributes.set(name, Attribute.of(name, value));
                }
              }
            }

            // Second pass: Look up implicit attributes on the feature mapping.
            for (const namespace of node.namespace) {
              for (const feature of Feature.lookup(namespace, node.name)) {
                for (const attribute of feature.attributes(node)) {
                  attributes = attributes.set(attribute.name, attribute);
                }
              }
            }

            // Third pass: Look up explicit `aria-*` attributes and set the
            // ones that are either global or supported by the role.
            for (const { name, value } of node.attributes) {
              if (Attribute.isName(name)) {
                const attribute = Attribute.of(name, value);

                if (
                  attribute.isGlobal() ||
                  role.some((role) => role.isAttributeSupported(attribute.name))
                ) {
                  attributes = attributes.set(name, attribute);
                }
              }
            }

            return Name.from(node, device).map((name) =>
              Element.of(node, role, name, attributes.values(), children)
            );
          });
        }

        // Other nodes are _never_ exposed in the accessibility tree.
        return Branched.of(Container.of(node, children));
      })
    );
  }

  export const { hasName, hasRole } = predicate;
}
