import type { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import type { Result } from "@siteimprove/alfa-result";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import { Token, type Parser as CSSParser } from "../../syntax/index.js";
import { Unit } from "../../unit/index.js";
import {
  Angle,
  Length,
  Number,
  type Numeric,
  Percentage,
} from "../numeric/index.js";

import { Expression } from "./expression.js";
import type { Function } from "./function/index.js";
import { Kind } from "./kind.js";

const { isAngle } = Angle;
const { isLength } = Length;
const { isNumber } = Number;
const { isPercentage } = Percentage;

const { delimited, either, map } = Parser;

/**
 * @public
 */
export class Value<N extends Numeric = Numeric> extends Expression {
  public static of<N extends Numeric = Numeric>(
    value: N,
    kindHint?: Kind,
  ): Value<N> {
    const kind = Selective.of(value)
      .if(isPercentage, () => Kind.of("percentage"))
      .if(isLength, () => Kind.of("length"))
      .if(isAngle, () => Kind.of("angle"))
      .else(() => kindHint ?? Kind.of())
      .get();

    return new Value(value, kind);
  }

  private readonly _value: N;

  protected constructor(value: N, kind: Kind) {
    super("value", kind);

    this._value = value;
  }

  public get value(): N {
    return this._value;
  }

  public reduce(
    this: Value<Angle>,
    resolver: Expression.Resolver,
  ): Value<Angle<Unit.Angle.Canonical>>;

  public reduce<L extends Unit.Length = Unit.Length.Canonical>(
    this: Value<Length>,
    resolver: Expression.Resolver<L>,
  ): Value<Length<Unit.Length.Canonical | L>>;

  public reduce(
    this: Value<Number>,
    resolver: Expression.Resolver,
  ): Value<Number>;

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(this: Value<Percentage>, resolver: Expression.Resolver<L, P>): Value<P>;

  public reduce<
    L extends Unit.Length = Unit.Length.Canonical,
    P extends Numeric = Numeric,
  >(resolver: Expression.Resolver<L, P>): Value {
    // Percentage are special. If it resolves to a number, we must keep the
    // number instead of carrying the kind of the percentage.
    // That is, when 100% = 10, 50% must be converted to 5, not to 5%.
    if (isPercentage(this._value)) {
      return Value.of(resolver.percentage(this._value));
    }

    return Value.of(
      Selective.of<Numeric>(this._value)
        .if(isLength, Value.lengthResolver(resolver.length))
        .if(isAngle, Value.angleResolver)
        .get(),
      this._kind,
    ).simplify();
  }

  public toAngle(): Result<Angle, string> {
    if (isAngle(this._value)) {
      return Ok.of(this._value);
    }

    if (this._kind.is("angle")) {
      return Ok.of(Angle.of(this._value.value, Unit.Angle.Canonical));
    }

    return Err.of(`${this} is not an angle`);
  }

  public toLength(): Result<Length, string> {
    if (isLength(this.value)) {
      return Ok.of(this.value);
    }

    if (this._kind.is("length")) {
      return Ok.of(Length.of(this._value.value, Unit.Length.Canonical));
    }

    return Err.of(`${this} is not a length`);
  }

  public toNumber(this: Value<Number>): Ok<Number>;

  public toNumber(this: Value<Exclude<Numeric, Number>>): Err<string>;

  public toNumber(): Result<Number, string> {
    if (isNumber(this.value)) {
      return Ok.of(this.value);
    }

    return Err.of(`${this} is not a number`);
  }

  public toPercentage(): Result<Percentage, string> {
    if (isPercentage(this.value)) {
      return Ok.of(this.value);
    }

    if (this._kind.is("percentage")) {
      return Ok.of(Percentage.of(this._value.value));
    }

    return Err.of(`${this} is not a percentage`);
  }

  public simplify(): Value {
    return this.toAngle()
      .orElse(this.toLength.bind(this))
      .orElse(this.toPercentage.bind(this))
      .orElse(this.toNumber.bind(this))
      .map((value) => Value.of(value, this._kind))
      .getOr(this);
  }

  public isCanonical(): boolean {
    return (
      Selective.of(this._value)
        .if(isAngle, (angle) => Unit.Angle.isCanonical(angle.unit))
        .if(isLength, (length) => Unit.Length.isCanonical(length.unit))
        // Either a raw number or a number with a kind, which only happens when
        // all units are canonical.
        .if(isNumber, () => true)
        .if(isPercentage, () => true)
        .else(() => false)
        .get()
    );
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
  export function angleResolver(angle: Angle): Angle<Unit.Angle.Canonical> {
    return angle.withUnit(Unit.Angle.Canonical);
  }

  /**
   * @internal
   */
  export function lengthResolver<U extends Unit.Length = Unit.Length.Canonical>(
    resolver: Mapper<Length<Unit.Length.Relative>, Length<U>>,
  ): Mapper<Length, Length<Unit.Length.Canonical> | Length<U>> {
    return (length) =>
      length.isRelative()
        ? resolver(length)
        : length.withUnit(Unit.Length.Canonical);
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-value}
   */
  export function parse(
    parseFunction: (parseSum: CSSParser<Expression>) => CSSParser<Function>,
    parseSum: CSSParser<Expression>,
  ): CSSParser<Expression> {
    return either<Slice<Token>, Expression, string>(
      map(
        either<Slice<Token>, Numeric, string>(
          Number.parse,
          Percentage.parse,
          Length.parse,
          Angle.parse,
        ),
        Value.of,
      ),
      parseFunction(parseSum),
      delimited(
        Token.parseOpenParenthesis,
        parseSum,
        Token.parseCloseParenthesis,
      ),
    );
  }
}
