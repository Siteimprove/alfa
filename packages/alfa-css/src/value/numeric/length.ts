import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Length as BaseLength, Math } from "../../calculation";
import { Token } from "../../syntax";
import { Unit } from "../../unit";
import { Value } from "../../value";
import { Expression } from "../../calculation/math-expression/expression";

const { either, map } = Parser;

type LengthCalc<
  CALC extends boolean,
  U extends Unit.Length
> = CALC extends false ? BaseLength<U> : Math<"length">;

/**
 * @public
 */
export class Length<
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = false
> extends Value<"length", CALC> {
  public static of<U extends Unit.Length>(
    value: number,
    unit: U
  ): Length<U, false>;

  public static of<U extends Unit.Length>(
    value: BaseLength<U>
  ): Length<U, false>;

  public static of(value: Math<"length">): Length<Unit.Length, true>;

  public static of<U extends Unit.Length>(
    value: number | BaseLength<U> | Math<"length">,
    unit?: U
  ) {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return new Length(false, BaseLength.of(value, unit!));
    } else {
      return new Length(Math.isCalculation(value), value);
    }
  }

  private readonly _value: LengthCalc<CALC, U>;

  private constructor(hasCalculation: CALC, value: LengthCalc<CALC, U>) {
    super("length", hasCalculation);
    this._value = value;
  }

  public get value(): LengthCalc<CALC, U> {
    return this._value;
  }

  /**
   * Resolve a Length into an absolute Length in pixels.
   */
  public resolve(resolver: Length.Resolver): Length<"px", false> {
    // The type constraint on CALC is not carried on the actual value
    // hasCalculation, so we need to assert types instead.
    if (this._hasCalculation) {
      const value = this._value as Math<"length">;
      // Since the expression has been correctly typed, it should always resolve.
      return new Length(
        false,
        value
          .resolve2(resolver)
          .getUnsafe(`Could not resolve ${value} as a length`)
      );
    } else {
      const value = this._value as BaseLength;
      if (value.isRelative()) {
        return new Length(false, resolver.length(value));
      } else {
        return new Length(false, value.withUnit("px"));
      }
    }
  }

  public equals(value: unknown): value is this {
    return value instanceof Length && value._value.equals(this._value);
  }

  public hash(hash: Hash): void {
    this._value.hash(hash);
  }

  public toJSON(): Length.JSON<CALC, U> {
    return {
      ...super.toJSON(),
      value: Serializable.toJSON(this._value),
    };
  }

  public toString(): string {
    return this._value.toString();
  }
}

/**
 * @public
 */
export namespace Length {
  export interface JSON<
    CALC extends boolean,
    U extends Unit.Length = Unit.Length
  > extends Value.JSON<"length"> {
    value: Serializable.ToJSON<LengthCalc<CALC, U>>;
  }

  export interface Resolver extends Expression.LengthResolver<"px"> {}

  export function isLength(value: unknown): value is Length {
    return value instanceof Length;
  }

  export function isZero<U extends Unit.Length>(
    length: Length<U, false>
  ): boolean {
    return length.value.value === 0;
  }

  export const parse: Parser<
    Slice<Token>,
    Length<Unit.Length, boolean>,
    string
  > = either(
    map<Slice<Token>, BaseLength, Length, string>(BaseLength.parse, Length.of),
    map(Math.parseLength, Length.of)
  );
}
