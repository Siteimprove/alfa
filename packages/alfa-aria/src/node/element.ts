import { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { None } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Refinement } from "@siteimprove/alfa-refinement";
import { String } from "@siteimprove/alfa-string";

import type * as dom from "@siteimprove/alfa-dom";

import type { Attribute } from "../attribute.js";
import type { Name } from "../name/index.js";
import { Node } from "../node.js";
import { Set } from "@siteimprove/alfa-set";
import { Role } from "../role.js";
import type { InputType } from "../../../alfa-dom/src/node/element/input-type.js";
import { Element as DomElement } from "@siteimprove/alfa-dom";
import { Selective } from "@siteimprove/alfa-selective";

/**
 * @public
 */
export class Element extends Node<"element"> {
  public static of(
    owner: dom.Node,
    role: Option<Role> = None,
    name: Option<Name> = None,
    attributes: Iterable<Attribute> = [],
    children: Iterable<Node> = [],
  ): Element {
    return new Element(
      owner,
      role,
      name,
      Array.from(attributes),
      Array.from(children),
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
    children: Array<Node>,
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
    refinement: Refinement<Attribute, Attribute<N>>,
  ): Option<Attribute<N>>;

  public attribute(predicate: Predicate<Attribute>): Option<Attribute>;

  public attribute<N extends Attribute.Name>(
    predicate: N,
  ): Option<Attribute<N>>;

  public attribute(
    predicate: Attribute.Name | Predicate<Attribute>,
  ): Option<Attribute> {
    return Iterable.find(
      this._attributes,
      typeof predicate === "string"
        ? (attribute) => attribute.name === predicate
        : predicate,
    );
  }

  public clone(): Element {
    return new Element(
      this._node,
      this._role,
      this._name,
      this._attributes,
      (this._children as Array<Node>).map((child) => child.clone()),
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
      ...this._children.map((child) => String.indent(child.toString())),
    ].join("\n");
  }

  private static allowedAttributesForInputType(
    inputType: InputType
  ): readonly Attribute.Name[] {
    switch (inputType) {
      // https://www.w3.org/TR/html-aria/#el-input-color
      case "color":
        return ["aria-disabled"];
      // https://www.w3.org/TR/html-aria/#el-input-date
      case "date":
      // https://www.w3.org/TR/html-aria/#el-input-datetime-local
      case "datetime-local":
      // https://www.w3.org/TR/html-aria/#el-input-email
      case "email":
      // https://www.w3.org/TR/html-aria/#el-input-month
      case "month":
      // https://www.w3.org/TR/html-aria/#el-input-password
      case "password":
      // https://www.w3.org/TR/html-aria/#el-input-time
      case "time":
      // https://www.w3.org/TR/html-aria/#el-input-week
      case "week":
        return Role.of("textbox").supportedAttributes;
      // https://www.w3.org/TR/html-aria/#el-input-file
      case "file":
        return ["aria-disabled", "aria-invalid", "aria-required"];
      default:
        return [];
    }
  }

  /**
   * The attributes that are allowed on this element, taking into consideration ARIA in HTML conformance requirements.
   * See {@link https://w3c.github.io/html-aria/#docconformance}
   */
  public allowedAttributes(): readonly Attribute.Name[] {
    const global = Role.of("roletype").supportedAttributes;
    const fromRole = this.role.map(role => role.supportedAttributes).getOr([]);
    const additional = Selective.of(this.node)
      .if(DomElement.hasName("input"), input =>
        Element.allowedAttributesForInputType(input.inputType())
      )
      // https://www.w3.org/TR/html-aria/#el-select
      .if(
        DomElement.hasName("select"),
        select =>
          DomElement.hasDisplaySize((size: Number) => size !== 1)(select)
            ? Role.of("combobox").supportedAttributes
            : Role.of("menu").supportedAttributes
      )
      .else(() => [])
      .get();

    return Array.from(Set.from([... global, ...fromRole, ...additional]));
  }

  public isAttributeAllowed(attribute: Attribute.Name): boolean {
    return this.allowedAttributes().includes(attribute);
  }
}

/**
 * @public
 */
export namespace Element {
  export interface JSON extends Node.JSON<"element"> {
    role: Role.Name | null;
    name: string | null;
    attributes: Array<Attribute.JSON>;
  }
}
