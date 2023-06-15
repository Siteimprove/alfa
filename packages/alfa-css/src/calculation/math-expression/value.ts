import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Some } from "@siteimprove/alfa-option/src/some";
import { Selective } from "@siteimprove/alfa-selective";

// TODO: resimplify
import { Percentage } from "../numeric";
import { Angle, Length, Number, Numeric } from "../numeric/index-new";

import { Unit } from "../../unit";

import { Expression } from "./expression";
import { Kind } from "./kind";

const { isAngle } = Angle;
const { isLength } = Length;
const { isNumber } = Number;
const { isPercentage } = Percentage;

/**
 * @public
 */
export class Value<N extends Numeric = Numeric> extends Expression {
  public static of<N extends Numeric = Numeric>(value: N): Value<N> {
    const kind = Selective.of(value)
      .if(isPercentage, () => Kind.of("percentage"))
      .if(isLength, () => Kind.of("length"))
      .if(isAngle, () => Kind.of("angle"))
      .else(() => Kind.of())
      .get();

    return new Value(value, kind);
  }

  private readonly _value: N;

  private constructor(value: N, kind: Kind) {
    super("value", kind);

    this._value = value;
  }

  public get value(): N {
    return this._value;
  }

  public reduce(
    this: Value<Angle>,
    resolver: Expression.Resolver
  ): Value<Angle<"deg">>;

  public reduce<L extends Unit.Length = "px">(
    this: Value<Length>,
    resolver: Expression.Resolver<L>
  ): Value<Length<"px" | L>>;

  public reduce(
    this: Value<Number>,
    resolver: Expression.Resolver
  ): Value<Number>;

  public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
    this: Value<Percentage>,
    resolver: Expression.Resolver<L, P>
  ): Value<P>;

  public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
    resolver: Expression.Resolver<L, P>
  ): Value {
    return Value.of(
      Selective.of<Numeric>(this._value)
        .if(isLength, Value.lengthResolver(resolver.length))
        .if(isAngle, Value.angleResolver)
        .if(isPercentage, resolver.percentage)
        .get()
    );
  }

  public toAngle(this: Value<Angle>): Some<Angle>;

  public toAngle(this: Value<Exclude<Numeric, Angle>>): None;

  public toAngle(): Option<Angle> {
    if (isAngle(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public toLength(this: Value<Length>): Some<Length>;

  public toLength(this: Value<Exclude<Numeric, Length>>): None;

  public toLength(): Option<Length> {
    if (isLength(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public toNumber(this: Value<Number>): Some<Number>;

  public toNumber(this: Value<Exclude<Numeric, Number>>): None;

  public toNumber(): Option<Number> {
    if (isNumber(this.value)) {
      return Option.of(this.value);
    }

    return None;
  }

  public toPercentage(this: Value<Percentage>): Some<Percentage>;

  public toPercentage(this: Value<Exclude<Numeric, Percentage>>): None;

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
