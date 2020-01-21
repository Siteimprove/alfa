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
    owner: Option<Element> = None
  ): Attribute {
    return new Attribute(namespace, prefix, name, value, owner);
  }

  private readonly _namespace: Option<Namespace>;
  private readonly _prefix: Option<string>;
  private readonly _name: string;
  private readonly _value: string;
  private readonly _owner: Option<Element>;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    value: string,
    owner: Option<Element>
  ) {
    super(self => [], None);

    this._namespace = namespace;
    this._prefix = prefix;
    this._name = name;
    this._value = value;
    this._owner = owner;
  }

  public get namespace(): Option<Namespace> {
    return this._namespace;
  }

  public get prefix(): Option<string> {
    return this._prefix;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public get owner(): Option<Element> {
    return this._owner;
  }

  /**
   * @see https://html.spec.whatwg.org/#boolean-attribute
   */
  public isBoolean(): boolean {
    switch (this._name) {
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
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      value: this._value
    };
  }

  public toString(): string {
    if (this.isBoolean()) {
      return this._name;
    }

    return `${this._name}="${this._value.replace(/"/g, "&quot;")}"`;
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
      Option.from(attribute.namespace as Namespace | null),
      Option.from(attribute.prefix),
      attribute.name,
      attribute.value,
      owner
    );
  }
}
