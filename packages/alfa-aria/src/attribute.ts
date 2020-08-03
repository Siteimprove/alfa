import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Attributes } from "./attribute/data";
import { Role } from "./role";

export class Attribute<N extends Attribute.Name = Attribute.Name>
  implements Equatable, Serializable {
  public static of<N extends Attribute.Name>(
    name: N,
    value: string
  ): Attribute<N> {
    return new Attribute(name, value);
  }

  private readonly _name: N;
  private readonly _value: string;

  private constructor(name: N, value: string) {
    this._name = name;
    this._value = value;
  }

  public get name(): N {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  /**
   * @see https://www.w3.org/TR/wai-aria/#global_states
   */
  public isGlobal(): this is Attribute<Attribute.Global> {
    return Role.of("roletype").isAttributeSupported(this._name);
  }

  public default(): Option<Attribute.Default<N>> {
    const value = Attributes[this._name].default;

    if (value === null) {
      return None;
    }

    return Option.of(value as Attribute.Default<N>);
  }

  public *options(): Iterable<Attribute.Option<N>> {
    for (const option of Attributes[this._name].options) {
      yield option as Attribute.Option<N>;
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Attribute &&
      value._name === this._name &&
      value._value === this._value
    );
  }

  public toJSON(): Attribute.JSON {
    return {
      name: this._name,
      value: this._value,
    };
  }
}

export namespace Attribute {
  export interface JSON {
    [key: string]: json.JSON;
    name: Name;
    value: string;
  }

  export type Name = keyof Attributes;

  export function isName(value: string): value is Name {
    return value in Attributes;
  }

  /**
   * The names of all global attributes.
   */
  export type Global = Role.Attribute.Supported<"roletype">;

  /**
   * The type of the specified attribute.
   */
  export type Type<N extends Name = Name> = Attributes[N]["type"];

  /**
   * The value type of the specified attribute.
   */
  export type Value<N extends Name = Name> = Attributes[N]["value"];

  /**
   * The default value, if any, of the specified attribute.
   *
   * @remarks
   * Attributes with no default are marked with `default: null`; we therefore
   * exclude `null` from the type as it corresponds to `never`.
   */
  export type Default<N extends Name = Name> = Exclude<
    Attributes[N]["default"],
    null
  >;

  /**
   * The type of the options allowed by the specified attribute.
   *
   * @see https://html.spec.whatwg.org/#enumerated-attribute
   *
   * @remarks
   * Only attributes that map to HTML enumerated attributes have a corresponding
   * option type.
   */
  export type Option<N extends Name = Name> = Members<Attributes[N]["options"]>;
}

type Members<T> = T extends Iterable<infer T> ? T : never;
