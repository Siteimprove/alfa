import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Length as BaseLength, Math } from "../../calculation";
import { Token } from "../../syntax";
import { Unit } from "../../unit";
import { Value } from "../../value";

const { either, map } = Parser;

type Calc<CALC extends boolean> = CALC extends true
  ? Math<"length">
  : undefined;
type NotCalc<CALC extends boolean, T> = CALC extends true ? undefined : T;

/**
 * @public
 */
export class Length<
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean
> extends Value<"length", CALC> {
  public static of<U extends Unit.Length>(
    value: number,
    unit: U
  ): Length.Fixed<U>;

  public static of<U extends Unit.Length>(
    value: BaseLength<U>
  ): Length.Fixed<U>;

  public static of(value: Math<"length">): Length.Calculated;

  public static of<U extends Unit.Length>(
    value: number | BaseLength<U> | Math<"length">,
    unit?: U
  ): Length.Mixed<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return new Length(false, value, unit!, undefined);
    }

    if (BaseLength.isLength(value)) {
      return new Length(false, value.value, value.unit, undefined);
    }

    return new Length<U, true>(true, undefined, undefined, value);
  }

  private readonly _value: NotCalc<CALC, number>;
  private readonly _unit: NotCalc<CALC, U>;
  private readonly _math: Calc<CALC>;

  private constructor(
    hasCalculation: CALC,
    value: NotCalc<CALC, number>,
    unit: NotCalc<CALC, U>,
    math: Calc<CALC>
  ) {
    super("length", hasCalculation);
    this._value = value;
    this._unit = unit;
    this._math = math;
  }

  public get value(): NotCalc<CALC, number> {
    return this._value;
  }

  public get unit(): NotCalc<CALC, U> {
    return this._unit;
  }

  public get math(): Calc<CALC> {
    return this._math;
  }

  public hasCalculation(this: Length.Mixed<U>): this is Length.Calculated {
    return super.hasCalculation();
  }

  /**
   * Resolve a Length into an absolute Length in pixels.
   */
  public resolve(resolver: Length.Resolver): Length.Fixed<"px"> {
    // The type constraint on CALC is not carried on the actual value
    // hasCalculation, so we need to assert types instead.
    if (this._hasCalculation) {
      return Length.of(
        this._math!.resolve2({ length: resolver })
          // Since the expression has been correctly typed, it should always resolve.
          .getUnsafe(`Could not resolve ${this._math!} as a length`)
      );
    } else {
      if (Unit.isRelativeLength(this._unit!)) {
        return Length.of(resolver(BaseLength.of(this._value!, this._unit!)));
      } else {
        return Length.of(
          BaseLength.of(this._value!, this._unit!).withUnit("px")
        );
      }
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Length &&
      value._hasCalculation === this._hasCalculation &&
      Equatable.equals(value._value, this._value) &&
      Equatable.equals(value._unit, this._unit) &&
      Equatable.equals(value._math, this._math)
    );
  }

  public hash(hash: Hash): void {
    hash.writeUnknown(this._value);
    hash.writeUnknown(this._unit);
    hash.writeUnknown(this._math);
  }

  public toJSON(
    this: Length.Mixed<U>
  ): Length.Fixed.JSON<U> | Length.Calculated.JSON {
    const base = super.toJSON();
    if (this.hasCalculation()) {
      return { ...base, math: this._math.toJSON() };
    }

    return { ...base, value: this._value, unit: this._unit };
  }

  public toString(this: Length.Mixed<U>): string {
    if (this.hasCalculation()) {
      return this._math.toString();
    }

    return BaseLength.of(this._value, this._unit).toString();
  }
}

/**
 * @public
 */
export namespace Length {
  /**
   * Convenience type for Length that contain calculation
   */
  export type Calculated = Length<Unit.Length, true>;
  /**
   * Convenience type for Length that do not  contain calculation
   */
  export type Fixed<U extends Unit.Length = Unit.Length> = Length<U, false>;
  /**
   * Convenience type for Length that may or not contain calculation
   */
  export type Mixed<U extends Unit.Length = Unit.Length> =
    | Calculated
    | Fixed<U>;

  export namespace Fixed {
    export interface JSON<U extends Unit.Length = Unit.Length>
      extends Value.JSON<"length"> {
      value: number;
      unit: string;
    }
  }

  export namespace Calculated {
    export interface JSON extends Value.JSON<"length"> {
      math: Math.JSON;
    }
  }
  // export interface JSON<
  //   CALC extends boolean,
  //   U extends Unit.Length = Unit.Length
  // > extends Value.JSON<"length"> {
  //   value: number | null;
  //   unit: string | null;
  //   math: Math.JSON | null;
  // }

  // TODO: we'll want to totally hide BaseLength, hence this resolver should
  // work on Length instead. This will require a wrapper in `resolve` since
  // math expressions can only work with BaseLength. We can't do that right now
  // because the resolver in `alfa-style` is still only aware of BaseLength…
  export type Resolver = Mapper<
    BaseLength<Unit.Length.Relative>,
    BaseLength<"px">
  >;

  export function isLength(value: unknown): value is Mixed {
    return value instanceof Length;
  }

  export const parse: Parser<Slice<Token>, Mixed, string> = either(
    map<Slice<Token>, BaseLength, Fixed, string>(BaseLength.parse, Length.of),
    map(Math.parseLength, Length.of)
  );

  export function isZero<U extends Unit.Length = Unit.Length>(
    length: Length<U, false>
  ): boolean {
    return length.value === 0;
  }
}
