import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "./role";

/**
 * @see https://w3c.github.io/aria/#accessibility_tree
 */
export abstract class Node {
  private readonly _node: dom.Node;
  private _children: Array<Node>;
  private _parent: Option<Node>;

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

  public children(): Sequence<Node> {
    return Sequence.from(this._children);
  }

  public parent(): Option<Node> {
    return this._parent;
  }

  public abstract name(): Option<string>;

  public abstract role(): Option<Role>;

  public abstract isIgnored(): boolean;

  public abstract clone(parent?: Option<Node>): Node;

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
  export function from(
    node: dom.Node,
    device: Device
  ): Branched<Option<Node>, Browser> {
    return build(node, device);
  }

  function build(
    node: dom.Node,
    device: Device,
    parent: Option<Node> = None
  ): Branched<Option<Node>, Browser> {
    let accessibleNode: Branched<Node, Browser>;

    // Text nodes are _always_ exposed in the accessibility tree.
    if (dom.Text.isText(node)) {
      accessibleNode = Branched.of(Text.of(node, Option.of(node.data)));
    }

    // Element node are _sometimes_ exposed in the accessibility tree.
    else if (dom.Element.isElement(node)) {
      if (
        node
          .attribute("aria-hidden")
          .some(attr => attr.value.toLowerCase() === "true")
      ) {
        return Branched.of(None);
      }

      accessibleNode = Role.from(node).map(role => Element.of(node, role));
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
        Option.of(
          accessibleNode.clone(parent).adopt(Iterable.flatten(children))
        )
      );
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

  public isIgnored(): boolean {
    return false;
  }

  public clone(parent: Option<Node> = None): Element {
    return new Element(
      this.node(),
      this._role,
      this._name,
      this._attributes,
      self => this.children().map(child => child.clone(Option.of(self))),
      parent
    );
  }
}

class Text extends Node {
  public static of(
    owner: dom.Node,
    name: Option<string>,
    children: Mapper<Node, Iterable<Node>> = () => [],
    parent: Option<Node> = None
  ): Text {
    return new Text(owner, name, children, parent);
  }

  private readonly _name: Option<string>;

  private constructor(
    owner: dom.Node,
    name: Option<string>,
    children: Mapper<Node, Iterable<Node>>,
    parent: Option<Node>
  ) {
    super(owner, children, parent);

    this._name = name;
  }

  public name(): Option<string> {
    return this._name;
  }

  public role(): None {
    return None;
  }

  public isIgnored(): boolean {
    return false;
  }

  public clone(parent: Option<Node> = None): Text {
    return new Text(
      this.node(),
      this._name,
      self => this.children().map(child => child.clone(Option.of(self))),
      parent
    );
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

  public name(): None {
    return None;
  }

  public role(): None {
    return None;
  }

  public isIgnored(): boolean {
    return true;
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this.node(),
      self => this.children().map(child => child.clone(Option.of(self))),
      parent
    );
  }
}
