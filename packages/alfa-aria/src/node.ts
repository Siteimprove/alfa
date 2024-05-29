import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Flags } from "@siteimprove/alfa-flags";
import { Graph } from "@siteimprove/alfa-graph";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

import * as dom from "@siteimprove/alfa-dom";
import * as tree from "@siteimprove/alfa-tree";

import { Attribute } from "./attribute";
import { Feature } from "./feature";
import { Name } from "./name";
import { Role } from "./role";

import { Container, Element, Inert, Text } from ".";

import * as predicate from "./node/predicate";

const { and, equals, not, test } = Predicate;
const { isRendered } = Style;
const { getElementIdMap, getElementDescendants } = dom.Query;

/**
 * {@link https://w3c.github.io/aria/#accessibility_tree}
 *
 * @public
 */
export abstract class Node<T extends string = string>
  extends tree.Node<Node.Traversal.Flag, tree.Node.SerializationOptions, T>
  implements Serializable<Node.JSON<T>>
{
  protected readonly _node: dom.Node;

  protected constructor(owner: dom.Node, children: Array<Node>, type: T) {
    super(children, type);
    this._node = owner;
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

  public attribute<N extends Attribute.Name>(
    refinement: Refinement<Attribute, Attribute<N>>,
  ): Option<Attribute<N>>;

  public attribute(predicate: Predicate<Attribute>): Option<Attribute>;

  public attribute<N extends Attribute.Name>(name: N): Option<Attribute<N>>;

  public attribute(
    predicate: Attribute.Name | Predicate<Attribute>,
  ): Option<Attribute> {
    return None;
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-parent}
   */
  public parent(options: Node.Traversal = Node.Traversal.empty): Option<Node> {
    const parent = this._parent as Option<Node>;

    if (options.has(Node.Traversal.ignored)) {
      return parent;
    }

    return parent.flatMap((parent) =>
      parent.isIgnored() ? parent.parent(options) : Option.of(parent),
    );
  }

  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-child}
   */
  public children(
    options: Node.Traversal = Node.Traversal.empty,
  ): Sequence<Node> {
    const children = Sequence.from(this._children) as Sequence<Node>;

    if (options.has(Node.Traversal.ignored)) {
      return children;
    }

    return children.flatMap((child) =>
      child.isIgnored() ? child.children(options) : Sequence.of(child),
    );
  }

  public abstract clone(parent?: Option<Node>): Node;

  public abstract isIgnored(): boolean;

  public toJSON(): Node.JSON<T> {
    return {
      ...super.toJSON(),
      node: this._node.path(dom.Node.fullTree),
    };
  }
}

/**
 * @public
 */
export interface Node {
  // Overriding type of tree traversal functions; due to constructor signature
  // we cannot mix in other kind of nodes.
  isParentOf(node: Node, options?: Node.Traversal): boolean;
  root(options?: Node.Traversal): Node;
  isRootOf(node: Node, options?: Node.Traversal): boolean;
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
  export interface JSON<T extends string = string> extends tree.Node.JSON<T> {
    node: string;
  }

  export class Traversal extends Flags<Traversal.Flag> {
    public static of(...flags: Array<Traversal.Flag>): Traversal {
      return new Traversal(Flags._reduce(...flags));
    }
  }

  export namespace Traversal {
    export type Flag = 0 | 1;

    export const none = 0 as Flag;

    /**
     * When set, traverse both exposed and ignored nodes.
     */
    export const ignored = (1 << 0) as Flag;

    export const empty = Traversal.of(none);
  }

  /**
   * Traversal options to include ignored nodes in the traversal.
   */
  export const includeIgnored = Traversal.of(Traversal.ignored);

  const cache = Cache.empty<Device, Cache<dom.Node, Node>>();

  export function from(node: dom.Node, device: Device): Node {
    const _cache = cache.get(device, Cache.empty);

    // If the cache already holds an entry for the specified node, then the tree
    // that the node participates in has already been built.
    if (_cache.has(node)) {
      // The previous test just ensures that there is something.
      return _cache.get(node).getUnsafe();
    }

    const root = node.root(dom.Node.flatTree);

    // If the cache already holds an entry for the root of the specified node,
    // then the tree that the node participates in has already been built, but
    // the node itself is not included within the resulting accessibility tree.
    if (_cache.has(root)) {
      return _cache.get(node, () => Inert.of(node));
    }

    // Before we start constructing the accessibility tree, we need to resolve
    // explicit ownership of elements as specified by the `aria-owns` attribute.
    // https://w3c.github.io/aria/#aria-owns

    // Find all elements in the tree. As explicit ownership is specified via ID
    // references, it cannot cross shadow or document boundaries.

    const exclusiveDescendants = getElementDescendants(root);
    const elements = dom.Element.isElement(root)
      ? exclusiveDescendants.prepend(root)
      : exclusiveDescendants;

    const ids = getElementIdMap(root);

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
                  element.ancestors().includes(reference),
              ),
          ] as const,
      ),
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
            claimed.has(reference) || graph.hasPath(reference, element),
        );

        // If there are no references left, this element has no explicit
        // ownership.
        if (references.isEmpty()) {
          return [claimed, owned, graph];
        }

        // Claim the remaining references.
        claimed = references.reduce(
          (claimed, reference) => claimed.add(reference),
          claimed,
        );

        // Connect the element to each of its references to track cycles.
        graph = references.reduce(
          (graph, reference) => graph.connect(element, reference),
          graph,
        );

        return [claimed, owned.set(element, references), graph];
      },
      [
        Set.empty<dom.Element>(),
        Map.empty<dom.Element, Sequence<dom.Element>>(),
        Graph.empty<dom.Element>(),
      ],
    );

    fromNode(root, device, claimed, owned, State.empty());

    return _cache.get(node, () =>
      // If the cache still doesn't hold an entry for the specified node, then
      // the node doesn't even participate in the tree. Store it as an inert
      // node.
      Inert.of(node),
    );
  }

  class State {
    private static _empty = new State(false, true);

    public static empty(): State {
      return this._empty;
    }

    private readonly _isPresentational: boolean;
    private readonly _isVisible: boolean;

    private constructor(isPresentational: boolean, isVisible: boolean) {
      this._isPresentational = isPresentational;
      this._isVisible = isVisible;
    }

    public get isPresentational(): boolean {
      return this._isPresentational;
    }

    public get isVisible(): boolean {
      return this._isVisible;
    }

    public presentational(isPresentational: boolean): State {
      if (this._isPresentational === isPresentational) {
        return this;
      }

      return new State(isPresentational, this._isVisible);
    }

    public visible(isVisible: boolean): State {
      if (this._isVisible === isVisible) {
        return this;
      }

      return new State(this._isPresentational, isVisible);
    }
  }

  function fromNode(
    node: dom.Node,
    device: Device,
    claimed: Set<dom.Node>,
    owned: Map<dom.Element, Sequence<dom.Node>>,
    state: State,
  ): Node {
    return cache.get(device, Cache.empty).get(node, () => {
      if (dom.Element.isElement(node)) {
        // Elements that are explicitly excluded from the accessibility tree
        // by means of `aria-hidden=true` are never exposed in the
        // accessibility tree, nor are their descendants.
        //
        // Since `aria-hidden` affects descendants in the accessibility tree,
        // not in the DOM, and since we build the accessibility tree top-down,
        // we never need to look at more than the current node.
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
              attribute.enumerate("true", "false").some(equals("true")),
            )
        ) {
          return Inert.of(node);
        }

        const style = Style.from(node, device);

        // Elements that are not rendered at all are never exposed in
        // the accessibility tree, nor are their descendants.
        //
        // Since `aria-owns` can create an accessibility tree that is fairly
        // different from the DOM tree, but being rendered is a property of the
        // DOM, we may "jump" onto a node which is not rendered due to some DOM
        // ancestor (so, unknowingly of the current accessibility tree traversal).
        // Therefore, we cannot just look at some property of the current node.
        //
        // Since `isRendered` is cached, and evaluating it is needed for almost
        // all nodes in the DOM, this is inexpensive.
        if (test(not(isRendered(device)), node)) {
          return Inert.of(node);
        }

        let children: (state: State) => Iterable<Node>;

        // Get the children explicitly owned by the element. Children can be
        // explicitly owned using the `aria-owns` attribute.
        const explicit = owned
          .get(node)
          .getOrElse(() => Sequence.empty<dom.Node>());

        // Get the children implicitly owned by the element. These are the
        // children in the flat tree that are neither claimed already nor
        // explicitly owned by the element.
        const implicit = node
          .children(dom.Node.flatTree)
          .reject((child) => claimed.has(child) || explicit.includes(child));

        // The children implicitly owned by the element come first, then the
        // children explicitly owned by the element.
        children = (state) =>
          implicit
            .concat(explicit)
            .map((child) => fromNode(child, device, claimed, owned, state));

        // Elements that are not visible by means of `visibility: hidden` or
        // `visibility: collapse`, are exposed in the accessibility tree as
        // containers as they may contain visible descendants.
        //
        // Since `visibility` is inherited, this correctly affects DOM descendants
        // even if `aria-owns` is used to rewrite the tree.
        if (style.computed("visibility").value.value !== "visible") {
          return Container.of(node, children(state.visible(false)));
        }

        state = state.visible(true);

        const role = Role.fromExplicit(node).orElse(() =>
          // If the element has no explicit role and instead inherits a
          // presentational role then use that, otherwise fall back to the
          // implicit role.
          state.isPresentational
            ? Option.of(Role.of("presentation"))
            : Role.fromImplicit(node),
        );

        if (role.some((role) => role.isPresentational())) {
          return Container.of(
            node,
            children(
              state.presentational(
                // If the implicit role of the presentational element has
                // required children then any owned children must also be
                // presentational.
                Role.fromImplicit(node).some((role) =>
                  role.hasRequiredChildren(),
                ),
              ),
            ),
          );
        }

        let attributes = Map.empty<Attribute.Name, Attribute>();

        // First pass: Look up implicit attributes on the role.
        if (role.isSome()) {
          for (const attribute of role.get().supportedAttributes) {
            for (const value of role.get().implicitAttributeValue(attribute)) {
              attributes = attributes.set(
                attribute,
                Attribute.of(attribute, value),
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

        // Third pass: Look up explicit `aria-*` attributes and set the ones
        // that are either global or supported by the role.
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

        // If the element has neither attributes, a role (other than generic),
        // nor a tabindex, it is not itself interesting for accessibility
        // purposes. It is therefore exposed as a container.
        // Some elements (mostly embedded content) are always exposed.
        if (
          attributes.isEmpty() &&
          role.every(Role.hasName("generic")) &&
          node.tabIndex().isNone() &&
          !test(alwaysExpose, node)
        ) {
          return Container.of(node, children(state), role);
        }

        // If the element has a role that designates its children as
        // presentational then set the state as presentational.
        if (role.some((role) => role.hasPresentationalChildren())) {
          state = state.presentational(true);
        }

        return Element.of(
          node,
          role,
          Name.from(node, device),
          attributes.values(),
          children(state),
        );
      }

      if (dom.Text.isText(node)) {
        // As elements with `visibility: hidden` are exposed as containers for
        // other elements that _might_ be visible, we need to check the
        // visibility of the parent element before deciding to expose the text
        // node. If the parent element isn't visible, the text node instead
        // becomes inert.
        if (!state.isVisible) {
          return Inert.of(node);
        }

        return Text.of(node, Name.from(node, device));
      }

      return Container.of(
        node,
        node
          .children(dom.Node.flatTree)
          .reject((child) => claimed.has(child))
          .map((child) => fromNode(child, device, claimed, owned, state)),
      );
    });
  }

  export const { hasAttribute, hasName, hasRole } = predicate;
}

/**
 * Some elements do not have an ARIA role but are nonetheless always exposed to
 * ATs. These are mostly embedded content.
 */
// <object> with a non-empty data attribute
const alwaysExpose = and(
  dom.Element.hasName("object"),
  dom.Element.hasAttribute("data", (data) => data.trim() !== ""),
);
