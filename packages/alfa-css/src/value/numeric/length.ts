import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Dimension, Math } from "../../calculation";
import { Length as BaseLength } from "../../calculation/numeric/length";
import { Token } from "../../syntax";
import { Converter, Unit } from "../../unit";
import { Value } from "../../value";
import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

const { either, map } = Parser;

class Calculated
  extends Value<"length", true>
  implements Length<Unit.Length, true>
{
  public static of(value: Math<"length">): Calculated {
    return new Calculated(value);
  }

  private readonly _math: Math<"length">;

  private constructor(math: Math<"length">) {
    super("length", true);
    this._math = math;
  }

  public get math(): Math<"length"> {
    return this._math;
  }

  public hasCalculation(): this is Calculated {
    return true;
  }

  public resolve(resolver: Length.Resolver): Fixed2<"px"> {
    return Fixed2.of(
      this._math
        .resolve2({
          // The math expression resolver is only aware of BaseLength and thus
          // wonk with these, but we want to abstract them from further layers,
          // so the resolver here is only aware of Length, and we need to
          // translate back and forth.
          length: (length) => {
            const resolved = resolver(Fixed2.of(length));
            return BaseLength.of(resolved.value, resolved.unit);
          },
        })
        // Since the expression has been correctly typed, it should always resolve.
        .getUnsafe(`Could not resolve ${this._math!} as a length`)
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Calculated && value._math.equals(this._math);
  }

  public hash(hash: Hash): void {
    this._math.hash(hash);
  }

  public toJSON(): Calculated.JSON {
    return { ...super.toJSON(), math: this._math.toJSON() };
  }

  public toString(): string {
    return this._math.toString();
  }
}

namespace Calculated {
  export interface JSON extends Value.JSON<"length"> {
    math: Math.JSON;
  }
}

// TODO: rename to Fixed once the temp Length.Fixed is removed.
class Fixed2<U extends Unit.Length = Unit.Length>
  extends Value<"length", false>
  implements Length<U>, Comparable<Fixed2<U>>
{
  public static of<U extends Unit.Length>(value: number, unit: U): Fixed2<U>;

  public static of<U extends Unit.Length>(value: BaseLength<U>): Fixed2<U>;

  public static of<U extends Unit.Length>(
    value: number | BaseLength<U>,
    unit?: U
  ): Fixed2<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return new Fixed2(value, unit!);
    }

    return new Fixed2(value.value, value.unit);
  }

  private readonly _value: number;
  private readonly _unit: U;

  private constructor(value: number, unit: U) {
    super("length", false);
    this._value = value;
    this._unit = unit;
  }

  public get canonicalUnit(): "px" {
    return "px";
  }

  public get value(): number {
    return this._value;
  }

  public get unit(): U {
    return this._unit;
  }

  public hasCalculation(): this is Calculated {
    return false;
  }

  public hasUnit<U extends Unit.Length>(unit: U): this is Fixed2<U> {
    return (this._unit as Unit.Length) === unit;
  }

  public withUnit<U extends Unit.Length>(unit: U): Fixed2<U> {
    if (this.hasUnit(unit)) {
      return this;
    }

    if (Unit.isAbsoluteLength(unit) && Unit.isAbsoluteLength(this._unit)) {
      return Fixed2.of(Converter.length(this._value, this._unit, unit), unit);
    }

    throw new Error(`Cannot convert ${this._unit} to ${unit}`);
  }

  public isRelative(): this is Fixed2<Unit.Length.Relative> {
    return Unit.isRelativeLength(this._unit);
  }

  public scale(factor: number): Fixed2<U> {
    return new Fixed2(this._value * factor, this._unit);
  }

  /**
   * Resolve a Length into an absolute Length in pixels.
   */
  public resolve(resolver: Length.Resolver): Fixed2<"px"> {
    return resolver(this);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Fixed2 &&
      Equatable.equals(value._value, this._value) &&
      Equatable.equals(value._unit, this._unit)
    );
  }

  public compare(value: Fixed2<U>): Comparison {
    const a = this.withUnit(this.canonicalUnit);
    const b = value.withUnit(value.canonicalUnit);

    return Comparable.compareNumber(a.value, b.value);
  }

  public hash(hash: Hash): void {
    hash.writeNumber(this._value).writeString(this._unit);
  }

  public toJSON(): Fixed2.JSON<U> {
    return { ...super.toJSON(), value: this._value, unit: this._unit };
  }

  public toString(): string {
    return BaseLength.of(this._value, this._unit).toString();
  }
}

// TODO: rename to Fixed once the temp Length.Fixed is removed.
namespace Fixed2 {
  export interface JSON<U extends Unit.Length = Unit.Length>
    extends Value.JSON<"length"> {
    value: number;
    unit: U;
  }
}

/**
 * @public
 */
export interface Length<
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean
> extends Value<"length", CALC> {
  hasCalculation(): this is Calculated;
  resolve(resolver: Length.Resolver): Fixed2<"px">;
}

/**
 * @public
 */
export namespace Length {
  /**
   * TODO: remove
   * This only need to be exported during math expression migration while stuff
   * is restricted to Fixed lengths.
   *
   * @internal
   */
  export type Fixed<U extends Unit.Length = Unit.Length> = Fixed2<U>;

  /**
   * TODO: remove
   * This only need to be exported during math expression migration while stuff
   * is restricted to Fixed lengths.
   *
   * @internal
   */
  export namespace Fixed {
    export interface JSON<U extends Unit.Length = Unit.Length>
      extends Value.JSON<"length"> {
      value: number;
      unit: U;
    }
  }

  export type JSON = Calculated.JSON | Fixed2.JSON;

  export type Length<U extends Unit.Length = Unit.Length> =
    | Calculated
    | Fixed2<U>;

  // In order to resolve a length, we need to know how to resolve relative
  // lengths.
  // Absolute lengths are just translated into another absolute unit.
  // Math expression have their own resolver, using this one when encountering
  // a relative length.
  export type Resolver = Mapper<Fixed2, Fixed2<"px">>;

  /**
   * Build a (fixed) length resolver, using basis for the relative units
   */
  export function resolver(
    emBase: Fixed2<"px">,
    remBase: Fixed2<"px">,
    vwBase: Fixed2<"px">,
    vhBase: Fixed2<"px">
  ): Resolver {
    return (length) => {
      const { unit, value } = length;
      const [min, max] =
        vhBase.value < vwBase.value ? [vhBase, vwBase] : [vwBase, vhBase];

      switch (unit) {
        // https://www.w3.org/TR/css-values/#em
        case "em":
          return emBase.scale(value);

        // https://www.w3.org/TR/css-values/#rem
        case "rem": {
          return remBase.scale(value);
        }

        // https://www.w3.org/TR/css-values/#ex
        case "ex":
        // https://www.w3.org/TR/css-values/#ch
        case "ch":
          return emBase.scale(value * 0.5);

        // https://www.w3.org/TR/css-values/#vh
        case "vh":
          return vhBase.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vw
        case "vw":
          return vwBase.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vmin
        case "vmin":
          return min.scale(value / 100);

        // https://www.w3.org/TR/css-values/#vmax
        case "vmax":
          return max.scale(value / 100);
      }

      return Fixed2.of(Converter.length(value, unit, "px"), "px");
    };
  }

  export function isLength(value: unknown): value is Length {
    return value instanceof Calculated || value instanceof Fixed2;
  }

  export function of<U extends Unit.Length>(value: number, unit: U): Fixed2<U>;

  export function of<U extends Unit.Length>(value: BaseLength<U>): Fixed2<U>;

  export function of(value: Math<"length">): Calculated;

  export function of<U extends Unit.Length>(
    value: number | BaseLength<U> | Math<"length">,
    unit?: U
  ): Length<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return Fixed2.of(value, unit!);
    }

    if (BaseLength.isLength(value)) {
      return Fixed2.of(value.value, value.unit);
    }

    return Calculated.of(value);
  }

  export const parse: Parser<Slice<Token>, Length, string> = either(
    map<Slice<Token>, BaseLength, Fixed2, string>(BaseLength.parse, Fixed2.of),
    map(Math.parseLength, Calculated.of)
  );

  // TODO: temporary helper needed during migration to calculated values.
  export const parseBase: Parser<Slice<Token>, Fixed2, string> = map<
    Slice<Token>,
    BaseLength,
    Fixed2,
    string
  >(BaseLength.parse, Fixed2.of);
}
