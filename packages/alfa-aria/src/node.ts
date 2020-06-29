import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import * as dom from "@siteimprove/alfa-dom";
import * as json from "@siteimprove/alfa-json";

import { Role } from "./role";
import { Feature } from "./feature";
import { getName } from "./get-name";

const { property, equals } = Predicate;

/**
 * @see https://w3c.github.io/aria/#accessibility_tree
 */
export abstract class Node implements Serializable {
  protected readonly _node: dom.Node;
  protected _children: Array<Node>;
  protected _parent: Option<Node>;

  protected constructor(
    owner: dom.Node,
    children: Mapper<Node, Iterable<Node>>,
    parent: Option<Node>
  ) {
    this._node = owner;
    this._children = Array.from(children(this));
    this._parent = parent;
  }

  public get node(): dom.Node {
    return this._node;
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

  public abstract name(): Option<string>;

  public abstract role(): Option<Role>;

  public abstract attribute(name: string): Option<string>;

  public abstract clone(parent?: Option<Node>): Node;

  public abstract isIgnored(): boolean;

  public abstract toJSON(): Node.JSON;

  /**
   * @internal
   */
  public adopt(children: Iterable<Node>): this {
    this._children.push(...children);

    for (const child of children) {
      child._parent = Option.of(this);
    }

    return this;
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
    node: dom.Node.JSON;
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

  function build(
    node: dom.Node,
    device: Device,
    parent: Option<Node> = None
  ): Branched<Node, Browser> {
    return cache.get(device, Cache.empty).get(node, () => {
      let accessibleNode: Branched<Node, Browser>;

      // Text nodes are _always_ exposed in the accessibility tree.
      if (dom.Text.isText(node)) {
        accessibleNode = Branched.of(
          Text.of(node, node.data.replace(/\s+/g, " "))
        );
      }

      // Element nodes are _sometimes_ exposed in the accessibility tree.
      else if (dom.Element.isElement(node)) {
        // Elements that are explicitly excluded from the accessibility tree by
        // means are `aria-hidden=true` are never exposed in the accessibility
        // tree, nor are their descendants.
        //
        // This behaviour is unfortunately not consistent across browsers, which
        // we may or may not want to deal with. For now, we pretend that all
        // browsers act consistently.
        //
        // https://github.com/Siteimprove/alfa/issues/184#issuecomment-593878009
        if (
          node
            .attribute("aria-hidden")
            .some((attr) => attr.value.toLowerCase() === "true")
        ) {
          return Branched.of(Inert.of(node));
        }

        const style = Style.from(node, device);

        // Elements that are not rendered at all by means of `display: none` are
        // never exposed in the accessibility tree, nor are their descendants.
        //
        // As we're building the accessibility tree top-down, we only need to
        // check the element itself for `display: none` and can safely disregard
        // its ancestors as they will already have been checked.
        if (style.computed("display").value[0].value === "none") {
          return Branched.of(Inert.of(node));
        }

        // Elements that are not visible by means of `visibility: hidden` or
        // `visibility: collapse`, are exposed in the accessibility tree as
        // containers as they may contain visible descendants.
        if (style.computed("visibility").value.value !== "visible") {
          accessibleNode = Branched.of(Container.of(node));
        } else {
          accessibleNode = Role.from(node).flatMap<Node>((role) => {
            if (role.some(Role.isPresentational)) {
              return Branched.of(Container.of(node));
            }

            let attributes = Map.empty<string, string>();

            // First pass: Look up implicit attributes on the role.
            if (role.isSome()) {
              const queue = [role.get()];

              while (queue.length > 0) {
                const role = queue.pop()!;

                for (const [name, value] of role.characteristics.implicits) {
                  attributes = attributes.set(name, value);
                }

                for (const name of role.characteristics.inherits) {
                  for (const role of Role.lookup(name)) {
                    queue.push(role);
                  }
                }
              }
            }

            // Second pass: Look up implicit attributes on the feature mapping.
            for (const namespace of node.namespace) {
              for (const feature of Feature.lookup(namespace, node.name)) {
                attributes = attributes.concat(feature.attributes(node));
              }
            }

            // Third pass: Look up explicit `aria-*` attributes and set the
            // ones that are allowed by the role.
            for (const attribute of node.attributes) {
              if (
                attribute.name.startsWith("aria-") &&
                role
                  .orElse(() => Role.lookup("roletype"))
                  .some((role) =>
                    role.isAllowed(property("name", equals(attribute.name)))
                  )
              ) {
                attributes = attributes.set(attribute.name, attribute.value);
              }
            }

            return getName(node, device).map((name) =>
              Element.of(node, role, name, attributes)
            );
          });
        }
      }

      // Other nodes are _never_ exposed in the accessibility tree.
      else {
        accessibleNode = Branched.of(Container.of(node));
      }

      return accessibleNode.flatMap((accessibleNode) => {
        const children = Branched.traverse(
          node.children({ flattened: true }),
          (child) => {
            return build(child, device);
          }
        );

        return children.map((children) =>
          accessibleNode.clone(parent).adopt(children)
        );
      });
    });
  }
}
