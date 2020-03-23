import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "../role";
import { Node } from "../node";

const { isEmpty } = Iterable;
const { not } = Predicate;

export class Element extends Node {
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
    this._name = name.map((name) => name.trim()).filter(not(isEmpty));
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
      (self) => this._children.map((child) => child.clone(Option.of(self))),
      parent
    );
  }

  public isIgnored(): boolean {
    return false;
  }

  public toJSON(): Element.JSON {
    return {
      type: "element",
      node: this._node.toJSON(),
      role: this._role.map((role) => role.name).getOr(null),
      name: this._name.getOr(null),
      attributes: this._attributes.toArray(),
      children: this._children.map((child) => child.toJSON()),
    };
  }

  public toString(): string {
    return [
      [
        this._role.map((role) => role.name).getOr("element"),
        ...this._name.map((name) => `"${name}"`),
      ].join(" "),
      ...this._children.map((child) => indent(child.toString())),
    ].join("\n");
  }
}

export namespace Element {
  export interface JSON extends Node.JSON {
    type: "element";
    role: string | null;
    name: string | null;
    attributes: Array<[string, string]>;
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
