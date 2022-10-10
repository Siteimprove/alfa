import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Selective } from "@siteimprove/alfa-selective";

import { Angle, Length, Number, Numeric, Percentage } from "../numeric";
import { Unit } from "../unit/unit";

import { Expression } from "./expression";
import { Kind } from "./kind";

const { isAngle } = Angle;
const { isLength } = Length;
const { isNumber } = Number;
const { isPercentage } = Percentage;

/**
 * @public
 */
export class Value extends Expression {
  public static of(value: Numeric): Value {
    return new Value(value);
  }

  private readonly _value: Numeric;

  private constructor(value: Numeric) {
    super();

    this._value = value;
  }

  public get type(): "value" {
    return "value";
  }

  public get kind(): Kind {
    const value = this._value;

    if (isPercentage(value)) {
      return Kind.of("percentage");
    }

    if (isLength(value)) {
      return Kind.of("length");
    }

    if (isAngle(value)) {
      return Kind.of("angle");
    }

    return Kind.of();
  }

  public get value(): Numeric {
    return this._value;
  }

  public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
    resolver: Expression.Resolver<L, P>
  ): Value {
    return Value.of(
      Selective.of(this._value)
        .if(isLength, Value.lengthResolver(resolver.length))
        .if(isAngle, Value.angleResolver)
        .if(isPercentage, resolver.percentage)
        .get()
    );
  }

  public toLength(): Option<Length> {
    if (isLength(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public toNumber(): Option<Number> {
    if (isNumber(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public toPercentage(): Option<Percentage> {
    if (isPercentage(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public equals(value: unknown): value is this {
    return value instanceof Value && value._value.equals(this._value);
  }

  public toJSON(): Value.JSON {
    return {
      type: "value",
      value: this._value.toJSON(),
    };
  }

  public toString(): string {
    return `${this._value}`;
  }
}

/**
 * @public
 */
export namespace Value {
  export interface JSON extends Expression.JSON {
    type: "value";
    value: Numeric.JSON;
  }

  export function isValueExpression(value: unknown): value is Value {
    return value instanceof Value;
  }

  /**
   * @internal
   */
  export function angleResolver(angle: Angle): Angle<"deg"> {
    return angle.withUnit("deg");
  }

  /**
   * @internal
   */
  export function lengthResolver<U extends Unit.Length = "px">(
    resolver: Mapper<Length<Unit.Length.Relative>, Length<U>>
  ): Mapper<Length, Length<"px"> | Length<U>> {
    return (length) =>
      length.isRelative() ? resolver(length) : length.withUnit("px");
  }
}
