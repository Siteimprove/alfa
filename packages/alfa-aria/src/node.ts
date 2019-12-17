import { Branched } from "@siteimprove/alfa-branched";
import { Cache } from "@siteimprove/alfa-cache";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Style } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "./role";
import { getName } from "./get-name";

/**
 * @see https://w3c.github.io/aria/#accessibility_tree
 */
export abstract class Node {
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

  public node(): dom.Node {
    return this._node;
  }

  public children(options: Node.Traversal = {}): Sequence<Node> {
    const children = Sequence.from(this._children);

    if (options.ignored === true) {
      return children;
    }

    return children.flatMap(child =>
      child.isIgnored() ? child.children(options) : Sequence.of(child)
    );
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    const parent = this._parent;

    if (options.ignored === true) {
      return parent;
    }

    return parent.flatMap(parent =>
      parent.isIgnored() ? parent.parent(options) : Option.of(parent)
    );
  }

  public abstract name(): Option<string>;

  public abstract role(): Option<Role>;

  public abstract clone(parent?: Option<Node>): Node;

  public abstract isIgnored(): boolean;

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

export namespace Node {
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
        accessibleNode = Branched.of(Text.of(node, node.data));
      }

      // Element nodes are _sometimes_ exposed in the accessibility tree.
      else if (dom.Element.isElement(node)) {
        if (
          node
            .attribute("aria-hidden")
            .some(attr => attr.value.toLowerCase() === "true")
        ) {
          return Branched.of(Inert.of(node));
        }

        const style = Style.from(node, device);

        if (
          style
            .cascaded("display")
            .some(display => display.value[0].value === "none")
        ) {
          return Branched.of(Inert.of(node));
        }

        if (
          style
            .computed("visibility")
            .some(visibility => visibility.value.value !== "visible")
        ) {
          accessibleNode = Branched.of(Container.of(node));
        } else {
          accessibleNode = Role.from(node).flatMap(role =>
            role.some(
              role => role.name === "none" || role.name === "presentation"
            )
              ? Branched.of(Container.of(node))
              : getName(node, device).map(name => Element.of(node, role, name))
          );
        }
      }

      // Other nodes are _never_ exposed in the accessibility tree.
      else {
        accessibleNode = Branched.of(Container.of(node));
      }

      return accessibleNode.flatMap(accessibleNode => {
        const children = Branched.traverse(
          node.children({ flattened: true }),
          child => {
            return build(child, device);
          }
        );

        return children.map(children =>
          accessibleNode.clone(parent).adopt(children)
        );
      });
    });
  }
}

class Element extends Node {
  public static of(
    owner: dom.Node,
    role: Option<Role> = None,
    name: Option<string> = None,
    attributes: Map<string, string> = Map.empty(),
    children: Mapper<Node, Iterable<Node>> = () => [],
    parent: Option<Node> = None
  ): Element {
    return new Element(owner, role, name, attributes, children, parent);
  }

  private readonly _role: Option<Role>;
  private readonly _name: Option<string>;
  private readonly _attributes: Map<string, string>;

  private constructor(
    owner: dom.Node,
    role: Option<Role>,
    name: Option<string>,
    attributes: Map<string, string>,
    children: Mapper<Node, Iterable<Node>>,
    parent: Option<Node>
  ) {
    super(owner, children, parent);

    this._role = role;
    this._name = name;
    this._attributes = attributes;
  }

  public attribute(name: string): Option<string> {
    return this._attributes.get(name);
  }

  public name(): Option<string> {
    return this._name;
  }

  public role(): Option<Role> {
    return this._role;
  }

  public clone(parent: Option<Node> = None): Element {
    return new Element(
      this._node,
      this._role,
      this._name,
      this._attributes,
      self => this._children.map(child => child.clone(Option.of(self))),
      parent
    );
  }

  public isIgnored(): boolean {
    return false;
  }

  public toString(): string {
    return [
      [
        this._role.map(role => role.name).getOr("element"),
        ...this._name.map(name => `"${name}"`)
      ].join(" "),
      ...this._children.map(child => indent(child.toString()))
    ].join("\n");
  }
}

class Text extends Node {
  public static of(
    owner: dom.Node,
    name: string,
    parent: Option<Node> = None
  ): Text {
    return new Text(owner, name, parent);
  }

  private readonly _name: string;

  private constructor(owner: dom.Node, name: string, parent: Option<Node>) {
    super(owner, () => [], parent);

    this._name = name;
  }

  public name(): Option<string> {
    return Option.of(this._name);
  }

  public role(): Option<Role> {
    return None;
  }

  public clone(parent: Option<Node> = None): Text {
    return new Text(this._node, this._name, parent);
  }

  public isIgnored(): boolean {
    return false;
  }

  public toString(): string {
    return `text "${this._name}"`;
  }
}

class Container extends Node {
  public static of(
    owner: dom.Node,
    children: Mapper<Node, Iterable<Node>> = () => [],
    parent: Option<Node> = None
  ): Container {
    return new Container(owner, children, parent);
  }

  private constructor(
    owner: dom.Node,
    children: Mapper<Node, Iterable<Node>>,
    parent: Option<Node>
  ) {
    super(owner, children, parent);
  }

  public name(): Option<string> {
    return None;
  }

  public role(): Option<Role> {
    return None;
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this._node,
      self => this._children.map(child => child.clone(Option.of(self))),
      parent
    );
  }

  public isIgnored(): boolean {
    return true;
  }

  public toString(): string {
    return [
      "container",
      ...this._children.map(child => indent(child.toString()))
    ].join("\n");
  }
}

class Inert extends Node {
  public static of(owner: dom.Node): Inert {
    return new Inert(owner);
  }

  private constructor(owner: dom.Node) {
    super(owner, () => [], None);
  }

  public name(): Option<string> {
    return None;
  }

  public role(): Option<Role> {
    return None;
  }

  public clone(): Inert {
    return new Inert(this._node);
  }

  public isIgnored(): boolean {
    return true;
  }

  public toString(): string {
    return "ignored";
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
