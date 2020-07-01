import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Namespace } from "../namespace";
import { Node } from "../node";
import { Element } from "./element";

const { isEmpty } = Iterable;
const { equals, not } = Predicate;

export class Attribute extends Node {
  public static of(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    value: string
  ): Attribute {
    return new Attribute(namespace, prefix, name, value);
  }

  private readonly _namespace: Option<Namespace>;
  private readonly _prefix: Option<string>;
  private readonly _name: string;
  private readonly _value: string;
  private _owner: Option<Element> = None;

  private constructor(
    namespace: Option<Namespace>,
    prefix: Option<string>,
    name: string,
    value: string
  ) {
    super([]);

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

  public get name(): string {
    return foldCase(this._name, this._owner);
  }

  public get value(): string {
    return this._value;
  }

  public get owner(): Option<Element> {
    return this._owner;
  }

  public hasName(predicate: Predicate<string>): boolean;

  public hasName(name: string, ...rest: Array<string>): boolean;

  public hasName(
    nameOrPredicate: string | Predicate<string>,
    ...names: Array<string>
  ): boolean {
    let predicate: Predicate<string>;

    if (typeof nameOrPredicate === "function") {
      predicate = nameOrPredicate;
    } else {
      const namesWithCases = [nameOrPredicate, ...names].map((name) =>
        foldCase(name, this._owner)
      );
      predicate = equals(...namesWithCases);
    }

    return predicate(foldCase(this._name, this._owner));
  }

  /**
   * @see https://html.spec.whatwg.org/#boolean-attribute
   */
  public isBoolean(): boolean {
    switch (foldCase(this._name, this._owner)) {
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

  public path(options?: Node.Traversal): string {
    let path = this.owner.map((owner) => owner.path(options)).getOr("/");

    path += path === "/" ? "" : "/";
    path += `@${foldCase(this._name, this._owner)}`;

    return path;
  }

  /**
   * @see https://html.spec.whatwg.org/#space-separated-tokens
   */
  public tokens(separator: string | RegExp = /\s+/): Sequence<string> {
    return Sequence.from(
      this._value.trim().split(separator).filter(not(isEmpty))
    );
  }

  /**
   * @see https://html.spec.whatwg.org/#enumerated-attribute
   */
  public enumerate(): Option<string>;

  /**
   * @see https://html.spec.whatwg.org/#enumerated-attribute
   */
  public enumerate<T extends string>(valid: T, ...rest: Array<T>): Option<T>;

  public enumerate(...valid: Array<string>): Option<string> {
    const value = this._value.toLowerCase();

    return valid.length === 0 || valid.includes(value)
      ? Option.of(value)
      : None;
  }

  public toJSON(): Attribute.JSON {
    return {
      type: "attribute",
      namespace: this._namespace.getOr(null),
      prefix: this._prefix.getOr(null),
      name: this._name,
      value: this._value,
    };
  }

  public toString(): string {
    const name = foldCase(this._name, this._owner);

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

export namespace Attribute {
  export interface JSON extends Node.JSON {
    type: "attribute";
    namespace: string | null;
    prefix: string | null;
    name: string;
    value: string;
  }

  export function isAttribute(value: unknown): value is Attribute {
    return value instanceof Attribute;
  }

  /**
   * @internal
   */
  export function fromAttribute(attribute: JSON): Trampoline<Attribute> {
    return Trampoline.done(
      Attribute.of(
        Option.from(attribute.namespace as Namespace | null),
        Option.from(attribute.prefix),
        attribute.name,
        attribute.value
      )
    );
  }

  export function hasName(predicate: Predicate<string>): Predicate<Attribute>;

  export function hasName(
    name: string,
    ...rest: Array<string>
  ): Predicate<Attribute>;

  export function hasName(
    nameOrPredicate: string | Predicate<string>,
    ...names: Array<string>
  ): Predicate<Attribute> {
    if (typeof nameOrPredicate === "function") {
      return (attribute) => attribute.hasName(nameOrPredicate);
    } else {
      return (attribute) => attribute.hasName(nameOrPredicate, ...names);
    }
  }
}

/**
 * Conditionally fold the case of an attribute name based on its owner; HTML
 * attributes are case insensitive while attributes in other namespaces aren't.
 */
function foldCase(name: string, owner: Option<Element>): string {
  return owner.some((owner) => owner.namespace.some(equals(Namespace.HTML)))
    ? name.toLowerCase()
    : name;
}
