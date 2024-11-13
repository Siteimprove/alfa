import type { Hash } from "@siteimprove/alfa-hash";

import type { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/ident}
 *
 * @public
 */
export abstract class Ident<
    T extends string = string,
    U extends string = string,
  >
  extends Value<T, false>
  implements Resolvable<Ident, never>
{
  protected readonly _value: U;

  protected constructor(type: T, value: U) {
    super(type, false);
    this._value = value;
  }

  public get value(): U {
    return this._value;
  }

  public is(...values: Array<string>): boolean {
    return values.includes(this._value);
  }

  public resolve(): Ident<T, U> {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Ident && value._value === this._value;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._value);
  }

  public toJSON(): Ident.JSON<T, U> {
    return {
      ...super.toJSON(),
      value: this._value,
    };
  }

  public toString(): U {
    return this._value;
  }
}

/**
 * @public
 */
export namespace Ident {
  export interface JSON<T extends string = string, U extends string = string>
    extends Value.JSON<T> {
    value: U;
  }

  export function isIdent(value: unknown): value is Ident {
    return value instanceof Ident;
  }
}
