import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Namespace } from "../namespace";
import { Node } from "../node";
import { Element } from "./element";

import * as predicate from "./attribute/predicate";

const { isEmpty } = Iterable;
const { equals, not } = Predicate;

/**
 * @public
 */
export class Attribute<N extends string = string> extends Node<"attribute"> {
  public static of<N extends string = string>(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: N,
    value: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ): Attribute<N> {
    return new Attribute(
      namespace,
      prefix,
      name,
      value,
      externalId,
      serializationId,
      extraData,
    );
  }

  private readonly _namespace: Option<Namespace>;
  private readonly _prefix: Option<string>;
  private readonly _name: N;
  private readonly _value: string;
  private _owner: Option<Element> = None;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: N,
    value: string,
    externalId?: string,
    serializationId?: string,
    extraData?: any,
  ) {
    super([], "attribute", externalId, serializationId, extraData);

    this._namespace = namespace;
    this._prefix = prefix;
    this._name = name;
    this._value = value;
  }

  public get namespace(): Option<Namespace> {
    return this._namespace;
  }

  public get prefix(): Option<string> {
    return this._prefix;
  }

  public get name(): N | Lowercase<N> {
    return Attribute.foldCase(this._name, this._owner);
  }

  public get qualifiedName(): string {
    return this._prefix.reduce<string>(
      (name, prefix) => `${prefix}:${name}`,
      this._name,
    );
  }

  public get value(): string {
    return this._value;
  }

  public get owner(): Option<Element> {
    return this._owner;
  }

  /**
   * {@link https://html.spec.whatwg.org/#boolean-attribute}
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

  /**
   * @internal
   **/
  protected _internalPath(options?: Node.Traversal): string {
    let path = this.owner.map((owner) => owner.path(options)).getOr("/");

    path += path === "/" ? "" : "/";
    path += `@${this.name}`;

    return path;
  }

  /**
   * {@link https://html.spec.whatwg.org/#space-separated-tokens}
   */
  public tokens(separator: string | RegExp = /\s+/): Sequence<string> {
    return Sequence.from(
      this._value.trim().split(separator).filter(not(isEmpty)),
    );
  }

  /**
   * {@link https://html.spec.whatwg.org/#enumerated-attribute}
   */
  public enumerate(): Option<string>;

  /**
   * {@link https://html.spec.whatwg.org/#enumerated-attribute}
   */
  public enumerate<T extends string>(valid: T, ...rest: Array<T>): Option<T>;

  public enumerate(...valid: Array<string>): Option<string> {
    const value = this._value.toLowerCase();

    return valid.length === 0 || valid.includes(value)
      ? Option.of(value)
      : None;
  }

  public toJSON(options?: Node.SerializationOptions): Attribute.JSON<N> {
    let result = {
      ...super.toJSON(options),
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      value: this._value,
    };
    delete result.children;

    return result;
  }

  public toString(): string {
    const name = this.qualifiedName;

    if (this.isBoolean()) {
      return name;
    }

    return `${name}="${this._value.replace(/"/g, "&quot;")}"`;
  }

  /**
   * @internal
   */
  public _attachParent(): boolean {
    return false;
  }

  /**
   * @internal
   */
  public _attachOwner(owner: Element): boolean {
    if (this._frozen || this._owner.isSome()) {
      return false;
    }

    this._owner = Option.of(owner);
    this._frozen = true;

    return true;
  }
}

/**
 * @public
 */
export namespace Attribute {
  export interface JSON<N extends string = string>
    extends Node.JSON<"attribute"> {
    namespace: string | null;
    prefix: string | null;
    name: N;
    value: string;
  }

  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  /**
   * @internal
   */
  export function fromAttribute<N extends string = string>(
    attribute: JSON<N>,
  ): Trampoline<Attribute<N>> {
    return Trampoline.done(
      Attribute.of(
        Option.from(attribute.namespace as Namespace | null),
        Option.from(attribute.prefix),
        attribute.name,
        attribute.value,
        attribute.externalId,
        attribute.serializationId,
      ),
    );
  }

  /**
   * @internal
   */
  export function cloneAttribute<N extends string = string>(
    attribute: Attribute<N>,
  ): Trampoline<Attribute<N | Lowercase<N>>> {
    return Trampoline.done(
      Attribute.of(
        attribute.namespace,
        attribute.prefix,
        attribute.name,
        attribute.value,
        attribute.externalId,
        attribute.serializationId,
        attribute.extraData,
      ),
    );
  }

  /**
   * Conditionally fold the case of an attribute name based on its owner; HTML
   * attributes are case insensitive while attributes in other namespaces aren't.
   *
   * @internal
   */
  export function foldCase<N extends string = string>(
    name: N,
    owner: Option<Element>,
  ): N | Lowercase<N> {
    return owner.some((owner) => owner.namespace.some(equals(Namespace.HTML)))
      ? (name.toLowerCase() as Lowercase<N>)
      : name;
  }

  export const { hasName } = predicate;
}
