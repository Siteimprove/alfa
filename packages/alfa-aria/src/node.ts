import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Graph } from "@siteimprove/alfa-graph";
import { Serializable } from "@siteimprove/alfa-json";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

import * as dom from "@siteimprove/alfa-dom";
import * as json from "@siteimprove/alfa-json";

import { Attribute } from "./attribute";
import { Name } from "./name";
import { Role } from "./role";
import { Feature } from "./feature";

import * as predicate from "./node/predicate";

const { equals } = Predicate;

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
    this._frozen = true;
    return this;
  }

  public attribute<N extends Attribute.Name>(
    refinement: Refinement<Attribute, Attribute<N>>
  ): Option<Attribute<N>>;

  public attribute(predicate: Predicate<Attribute>): Option<Attribute>;

  public attribute<N extends Attribute.Name>(
    predicate: N
  ): Option<Attribute<N>>;

  public attribute(
    predicate: Attribute.Name | Predicate<Attribute>
  ): Option<Attribute> {
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
    if (this._frozen || this._parent.isSome()) {
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

    // If the cache already holds an entry for the specified node, then the tree
    // that the node participates in has already been built.
    if (_cache.has(node)) {
      return _cache.get(node).get();
    }

    const root = node.root({ flattened: true });

    // If the cache already holds an entry for the root of the specified node,
    // then the tree that the node participates in has already been built, but
    // the node itself is not included within the resulting accessibility tree.
    if (_cache.has(root)) {
      return _cache.get(node, () => Branched.of(Inert.of(node)));
    }

    // Before we start constructing the accessibility tree, we need to resolve
    // explicit ownership of elements as specified by the `aria-owns` attribute.
    // https://w3c.github.io/aria/#aria-owns

    // Find all elements in the tree. As explicit ownership is specified via ID
    // references, it cannot cross shadow or document boundaries.
    const elements = root.inclusiveDescendants().filter(dom.Element.isElement);

    // Build a map from ID -> element to allow fast resolution of ID references.
    // The collected references are added to the map in reverse order to ensure
    // that the first occurrence of a given ID is what ends up in the map in
    // event of duplicates.
    const ids = Map.from(
      elements
        .collect((element) => element.id.map((id) => [id, element] as const))
        .reverse()
    );

    // Do a first pass over `aria-owns` attributes and collect the referenced
    // elements.
    const references = elements.collect((element) =>
      element.attribute("aria-owns").map(
        (attribute) =>
          [
            element,
            attribute
              .tokens()
              .collect((id) => ids.get(id))
              // Reject references from the element to itself or its ancestors
              // as these would cause cyclic references.
              .reject(
                (reference) =>
                  element === reference ||
                  element.ancestors().includes(reference)
              ),
          ] as const
      )
    );

    // Refine the collected `aria-owns` references, constructing a set of
    // claimed elements and resolving conflicting claims as needed.
    const [claimed, owned] = references.reduce(
      ([claimed, owned, graph], [element, references]) => {
        // Reject all element references that have either already been claimed
        // or would introduce a cyclic reference. While authors are not allowed
        // to specify a given ID in more than one `aria-owns` attribute, it will
        // inevitably happen that multiple `aria-owns` attributes reference the
        // same ID. We deal with this on a first come, first serve basis and
        // deny anything but the first claim to a given ID.
        references = references.reject(
          (reference) =>
            claimed.has(reference) || graph.hasPath(reference, element)
        );

        // If there are no references left, this element has no explicit
        // ownership.
        if (references.isEmpty()) {
          return [claimed, owned, graph];
        }

        // Claim the remaining references.
        claimed = references.reduce(
          (claimed, reference) => claimed.add(reference),
          claimed
        );

        // Connect the element to each of its references to track cycles.
        graph = references.reduce(
          (graph, reference) => graph.connect(element, reference),
          graph
        );

        return [claimed, owned.set(element, references), graph];
      },
      [
        Set.empty<dom.Element>(),
        Map.empty<dom.Element, Sequence<dom.Element>>(),
        Graph.empty<dom.Element>(),
      ]
    );

    build(root, device, claimed, owned);

    return _cache.get(node, () =>
      // If the cache still doesn't hold an entry for the specified node, then
      // the node doesn't even participate in the tree. Store it as an inert
      // node.
      Branched.of(Inert.of(node))
    );
  }

  function build(
    node: dom.Node,
    device: Device,
    claimed: Set<dom.Node>,
    owned: Map<dom.Element, Sequence<dom.Node>>
  ): Branched<Node, Browser> {
    return cache.get(device, Cache.empty).get(node, () => {
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

        let children: Branched<Iterable<Node>, Browser>;

        // Children of <iframe> elements act as fallback content in legacy user
        // agents and should therefore never be included in the accessibility
        // tree.
        if (node.name === "iframe") {
          children = Branched.of([]);
        }

        // Otherwise, recursively build accessible nodes for the children of the
        // element.
        else {
          // Get the children explicitly owned by the element. Children can be
          // explicitly owned using the `aria-owns` attribute.
          const explicit = owned
            .get(node)
            .getOrElse(() => Sequence.empty<dom.Node>());

          // Get the children implicitly owned by the element. These are the
          // children in the flat tree that are neither claimed already nor
          // explicitly owned by the element.
          const implicit = node
            .children({ flattened: true })
            .reject((child) => claimed.has(child) || explicit.includes(child));

          // The children implicitly owned by the element come first, then the
          // children explicitly owned by the element.
          children = Branched.traverse(implicit.concat(explicit), (child) =>
            build(child, device, claimed, owned)
          );
        }

        // Elements that are not visible by means of `visibility: hidden` or
        // `visibility: collapse`, are exposed in the accessibility tree as
        // containers as they may contain visible descendants.
        if (style.computed("visibility").value.value !== "visible") {
          return children.map((children) => Container.of(node, children));
        }

        return Role.from(node).flatMap<Node>((role) => {
          if (role.some((role) => role.isPresentational())) {
            return children.map((children) => Container.of(node, children));
          }

          let attributes = Map.empty<Attribute.Name, Attribute>();

          // First pass: Look up implicit attributes on the role.
          if (role.isSome()) {
            for (const attribute of role.get().attributes) {
              for (const value of role
                .get()
                .implicitAttributeValue(attribute)) {
                attributes = attributes.set(
                  attribute,
                  Attribute.of(attribute, value)
                );
              }
            }
          }

          // Second pass: Look up implicit attributes on the feature mapping.
          for (const namespace of node.namespace) {
            for (const feature of Feature.from(namespace, node.name)) {
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

          // If the element has neither attributes, a role, nor a tabindex, it
          // is not itself interesting for accessibility purposes. It is
          // therefore exposed as a container.
          if (
            attributes.isEmpty() &&
            role.isNone() &&
            node.tabIndex().isNone()
          ) {
            return children.map((children) => Container.of(node, children));
          }

          return children.flatMap((children) =>
            Name.from(node, device).map((name) =>
              Element.of(node, role, name, attributes.values(), children)
            )
          );
        });
      }

      if (dom.Text.isText(node)) {
        // As elements with `visibility: hidden` are exposed as containers for
        // other elements that _might_ be visible, we need to check the
        // visibility of the parent element before deciding to expose the text
        // node. If the parent element isn't visible, the text node instead
        // becomes inert.
        if (
          node
            .parent({ flattened: true })
            .filter(dom.Element.isElement)
            .some(
              (parent) =>
                Style.from(parent, device).computed("visibility").value
                  .value !== "visible"
            )
        ) {
          return Branched.of(Inert.of(node));
        }

        return Name.from(node, device).map((name) => Text.of(node, name));
      }

      const children = Branched.traverse(
        node
          .children({ flattened: true })
          .reject((child) => claimed.has(child)),
        (child) => build(child, device, claimed, owned)
      );

      return children.map((children) => Container.of(node, children));
    });
  }

  export const { hasName, hasRole } = predicate;
}
