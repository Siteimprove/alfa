import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Math } from "../../calculation";
import { Length as BaseLength } from "../../calculation/numeric/length";
import { Token } from "../../syntax";
import { Converter, Unit } from "../../unit";
import { Value } from "../../value";

const { either, map } = Parser;

/**
 * @public
 */
export interface Length<
  U extends Unit.Length = Unit.Length,
  CALC extends boolean = boolean
> extends Value<"length", CALC> {
  hasCalculation(): this is Length.Calculated;
  resolve(resolver: Length.Resolver): Length.Fixed<"px">;
}

/**
 * @public
 */
export namespace Length {
  export class Calculated
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

    public resolve(resolver: Resolver): Fixed<"px"> {
      return Fixed.of(
        this._math!.resolve2({
          length: (length) => {
            const resolved = resolver(Fixed.of(length));
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

  export namespace Calculated {
    export interface JSON extends Value.JSON<"length"> {
      math: Math.JSON;
    }
  }

  export class Fixed<U extends Unit.Length = Unit.Length> extends Value<
    "length",
    false
  > {
    public static of<U extends Unit.Length>(value: number, unit: U): Fixed<U>;

    public static of<U extends Unit.Length>(value: BaseLength<U>): Fixed<U>;

    public static of<U extends Unit.Length>(
      value: number | BaseLength<U>,
      unit?: U
    ): Fixed<U> {
      if (typeof value === "number") {
        // The overloads ensure that unit is not undefined
        return new Fixed(value, unit!);
      }

      return new Fixed(value.value, value.unit);
    }

    private readonly _value: number;
    private readonly _unit: U;

    private constructor(value: number, unit: U) {
      super("length", false);
      this._value = value;
      this._unit = unit;
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

    public hasUnit<U extends Unit.Length>(unit: U): this is Fixed<U> {
      return (this._unit as Unit.Length) === unit;
    }

    public withUnit<U extends Unit.Length>(unit: U): Fixed<U> {
      if (this.hasUnit(unit)) {
        return this;
      }

      if (Unit.isAbsoluteLength(unit) && Unit.isAbsoluteLength(this._unit)) {
        return Fixed.of(Converter.length(this._value, this._unit, unit), unit);
      }

      throw new Error(`Cannot convert ${this._unit} to ${unit}`);
    }

    public isRelative(): this is Fixed<Unit.Length.Relative> {
      return Unit.isRelativeLength(this._unit);
    }

    /**
     * Resolve a Length into an absolute Length in pixels.
     */
    public resolve(resolver: Resolver): Fixed<"px"> {
      return this.isRelative() ? resolver(this) : this.withUnit("px");
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Fixed &&
        Equatable.equals(value._value, this._value) &&
        Equatable.equals(value._unit, this._unit)
      );
    }

    public hash(hash: Hash): void {
      hash.writeNumber(this._value).writeString(this._unit);
    }

    public toJSON(): Fixed.JSON<U> {
      return { ...super.toJSON(), value: this._value, unit: this._unit };
    }

    public toString(): string {
      return BaseLength.of(this._value, this._unit).toString();
    }
  }

  export namespace Fixed {
    export interface JSON<U extends Unit.Length = Unit.Length>
      extends Value.JSON<"length"> {
      value: number;
      unit: U;
    }
  }

  export type Mixed<U extends Unit.Length = Unit.Length> =
    | Calculated
    | Fixed<U>;

  export type Resolver = Mapper<
    Length<Unit.Length.Relative>,
    Length.Fixed<"px">
  >;

  export function isLength(value: unknown): value is Mixed {
    return value instanceof Calculated || value instanceof Fixed;
  }

  export const parse: Parser<Slice<Token>, Mixed, string> = either(
    map<Slice<Token>, BaseLength, Fixed, string>(BaseLength.parse, Fixed.of),
    map(Math.parseLength, Calculated.of)
  );

  // TODO: temporary helper needed during migration to calculated values.
  export const parseBase: Parser<Slice<Token>, Fixed, string> = map<
    Slice<Token>,
    BaseLength,
    Fixed,
    string
  >(BaseLength.parse, Fixed.of);

  export function isZero<U extends Unit.Length = Unit.Length>(
    length: Fixed<U>
  ): boolean {
    return length.value === 0;
  }

  export function of<U extends Unit.Length>(value: number, unit: U): Fixed<U>;

  export function of<U extends Unit.Length>(value: BaseLength<U>): Fixed<U>;

  export function of(value: Math<"length">): Calculated;

  export function of<U extends Unit.Length>(
    value: number | BaseLength<U> | Math<"length">,
    unit?: U
  ): Length.Mixed<U> {
    if (typeof value === "number") {
      // The overloads ensure that unit is not undefined
      return Fixed.of(value, unit!);
    }

    if (BaseLength.isLength(value)) {
      return Fixed.of(value.value, value.unit);
    }

    return Calculated.of(value);
  }
}
