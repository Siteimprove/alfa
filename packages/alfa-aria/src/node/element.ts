import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import * as dom from "@siteimprove/alfa-dom";

import { Attribute } from "../attribute";
import { Name } from "../name";
import { Node } from "../node";
import { Role } from "../role";

/**
 * @public
 */
export class Element extends Node<"element"> {
  public static of(
    owner: dom.Node,
    role: Option<Role> = None,
    name: Option<Name> = None,
    attributes: Iterable<Attribute> = [],
    children: Iterable<Node> = []
  ): Element {
    return new Element(
      owner,
      role,
      name,
      Array.from(attributes),
      Array.from(children)
    );
  }

  private readonly _role: Option<Role>;
  private readonly _name: Option<Name>;
  private readonly _attributes: Array<Attribute>;

  private constructor(
    owner: dom.Node,
    role: Option<Role>,
    name: Option<Name>,
    attributes: Array<Attribute>,
    children: Array<Node>
  ) {
    super(owner, children, "element");

    this._role = role;
    this._name = name;
    this._attributes = attributes;
  }

  public get role(): Option<Role> {
    return this._role;
  }

  public get name(): Option<Name> {
    return this._name;
  }

  public get attributes(): ReadonlyArray<Attribute> {
    return this._attributes;
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
    return Iterable.find(
      this._attributes,
      typeof predicate === "string"
        ? (attribute) => attribute.name === predicate
        : predicate
    );
  }

  public clone(): Element {
    return new Element(
      this._node,
      this._role,
      this._name,
      this._attributes,
      (this._children as Array<Node>).map((child) => child.clone())
    );
  }

  public isIgnored(): boolean {
    return false;
  }

  public toJSON(): Element.JSON {
    return {
      ...super.toJSON(),
      role: this._role.map((role) => role.name).getOr(null),
      name: this._name.map((name) => name.value).getOr(null),
      attributes: this._attributes.map((attribute) => attribute.toJSON()),
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

/**
 * @public
 */
export namespace Element {
  export interface JSON extends Node.JSON<"element"> {
    role: string | null;
    name: string | null;
    attributes: Array<Attribute.JSON>;
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
