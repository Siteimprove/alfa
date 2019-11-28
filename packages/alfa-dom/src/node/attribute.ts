import { None, Option } from "@siteimprove/alfa-option";

import { Namespace } from "../namespace";
import { Node } from "../node";
import { Element } from "./element";

export class Attribute extends Node {
  public static of(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    value: string,
    owner: Option<Element>
  ): Attribute {
    return new Attribute(namespace, prefix, name, value, owner);
  }

  public readonly namespace: Option<Namespace>;
  public readonly prefix: Option<string>;
  public readonly name: string;
  public readonly value: string;
  public readonly owner: Option<Element>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    value: string,
    owner: Option<Element>
  ) {
    super(self => [], None);

    this.namespace = namespace;
    this.prefix = prefix;
    this.name = name;
    this.value = value;
    this.owner = owner;
  }

  /**
   * @see https://html.spec.whatwg.org/#boolean-attribute
   */
  public isBoolean(): boolean {
    switch (this.name) {
      case "allowfullscreen":
      case "allowpaymentrequest":
      case "async":
      case "autofocus":
      case "autoplay":
      case "checked":
      case "controls":
      case "default":
        return true;

      default:
        return false;
    }
  }

  public toJSON(): Attribute.JSON {
    return {
      type: "attribute",
      namespace: this.namespace.getOr(null),
      prefix: this.prefix.getOr(null),
      name: this.name,
      value: this.value
    };
  }

  public toString(): string {
    if (this.isBoolean()) {
      return this.name;
    }

    return `${this.name}="${this.value.replace(/"/g, "&quot;")}"`;
  }
}

export namespace Attribute {
  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  export interface JSON {
    type: "attribute";
    namespace: string | null;
    prefix: string | null;
    name: string;
    value: string;
  }

  export function fromAttribute(
    attribute: JSON,
    owner: Option<Element> = None
  ): Attribute {
    return Attribute.of(
      Option.from(attribute.namespace as Namespace),
      Option.from(attribute.prefix),
      attribute.name,
      attribute.value,
      owner
    );
  }
}
