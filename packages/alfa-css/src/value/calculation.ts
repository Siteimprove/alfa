import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Record } from "@siteimprove/alfa-record";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";
import { Function } from "../syntax/function";

import { Value } from "../value";

import { Angle } from "./angle";
import { Dimension } from "./dimension";
import { Integer } from "./integer";
import { Length } from "./length";
import { Number } from "./number";
import { Numeric } from "./numeric";
import { Percentage } from "./percentage";
import { Unit } from "./unit";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";

const { map, flatMap, either, delimited, pair, option } = Parser;
const { isPercentage } = Percentage;
const { isNumber } = Number;
const { isInteger } = Integer;
const { isDimension } = Dimension;
const { isLength } = Length;
const { isAngle } = Angle;

export class Calculation extends Value<"calculation"> {
  public static of(expression: Calculation.Expression): Calculation {
    return new Calculation(expression.reduce((value) => value));
  }

  private readonly _expression: Calculation.Expression;

  private constructor(expression: Calculation.Expression) {
    super();

    this._expression = expression;
  }

  public get type(): "calculation" {
    return "calculation";
  }

  public get expression(): Calculation.Expression {
    return this._expression;
  }

  public reduce(resolve: Mapper<Numeric>): Calculation {
    return new Calculation(this._expression.reduce(resolve));
  }

  public hash(hash: Hash): void {}

  public equals(value: unknown): value is this {
    return (
      value instanceof Calculation && value._expression.equals(this._expression)
    );
  }

  public toJSON(): Calculation.JSON {
    return {
      type: "calculation",
      expression: this._expression.toJSON(),
    };
  }

  public toString(): string {
    return `calc(${this._expression})`;
  }
}

export namespace Calculation {
  export interface JSON {
    [key: string]: json.JSON;
    type: "calculation";
    expression: Expression.JSON;
  }

  /**
   * @see https://drafts.css-houdini.org/css-typed-om-1/#numeric-typing
   *
   * @remarks
   * The shared `Value` interface already uses the term "type" to denote the
   * different types of CSS values. We therefore use the term "kind" to denote
   * the type of a calculation.
   */
  export class Kind implements Equatable, Serializable {
    public static of(kind?: Kind.Base): Kind {
      const kinds = this._empty._kinds;

      return new Kind(kind === undefined ? kinds : kinds.set(kind, 1), None);
    }

    private static _empty = new Kind(
      Record.of({
        length: 0,
        angle: 0,
        time: 0,
        frequency: 0,
        resolution: 0,
        percentage: 0,
      }),
      None
    );

    public static empty(): Kind {
      return this._empty;
    }

    private readonly _kinds: Kind.Map;

    private readonly _hint: Option<Kind.Hint>;

    private constructor(kinds: Kind.Map, hint: Option<Kind.Hint>) {
      this._kinds = kinds;
      this._hint = hint;
    }

    public get kinds(): Kind.Map {
      return this._kinds;
    }

    public get hint(): Option<Kind.Hint> {
      return this._hint;
    }

    public is(
      kind?: Kind.Base,
      value: number = 1,
      hinted: boolean = kind === "percentage"
    ): boolean {
      for (const entry of this._kinds) {
        if (entry[1] === 0) {
          continue;
        }

        if (kind !== undefined) {
          if (entry[0] === kind && entry[1] === value) {
            break;
          }
        }

        return false;
      }

      return this._hint.isNone() || hinted;
    }

    /**
     * @see https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-add-two-types
     */
    public add(kind: Kind): Result<Kind, string> {
      let a: Kind = this;
      let b: Kind = kind;

      if (a._hint.some((a) => b._hint.some((b) => a !== b))) {
        return Err.of(`Cannot add types ${a} and ${b}`);
      }

      if (a._hint.isNone()) {
        for (const hint of b._hint) {
          a = a.apply(hint);
        }
      }

      if (b._hint.isNone()) {
        for (const hint of a._hint) {
          b = b.apply(hint);
        }
      }

      if (a._kinds.equals(b._kinds)) {
        return Result.of(a);
      }

      if (
        [a._kinds, b._kinds].some(
          (kinds) => kinds.get("percentage").get() !== 0
        ) &&
        [a._kinds, b._kinds].some((kinds) =>
          kinds.some((value, kind) => kind !== "percentage" && value !== 0)
        )
      ) {
        for (const hint of [
          "length",
          "angle",
          "time",
          "frequency",
          "resolution",
        ] as const) {
          const kind = a.apply(hint);

          if (kind._kinds.equals(b.apply(hint)._kinds)) {
            return Result.of(kind);
          }
        }
      }

      return Err.of(`Cannot add types ${a} and ${b}`);
    }

    /**
     * @see https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-multiply-two-types
     */
    public multiply(kind: Kind): Result<Kind, string> {
      let a: Kind = this;
      let b: Kind = kind;

      if (a._hint.some((a) => b._hint.some((b) => a !== b))) {
        return Err.of(`Cannot multiply types ${a} and ${b}`);
      }

      if (a._hint.isNone()) {
        for (const hint of b._hint) {
          a = a.apply(hint);
        }
      }

      if (b._hint.isNone()) {
        for (const hint of a._hint) {
          b = b.apply(hint);
        }
      }

      return Result.of(
        new Kind(
          b._kinds.reduce(
            (kinds, value, kind) =>
              kinds.set(kind, kinds.get(kind).get() + value),
            a._kinds
          ),
          a._hint
        )
      );
    }

    /**
     * @see https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-invert-a-type
     */
    public invert(): Kind {
      return new Kind(
        this._kinds.reduce(
          (kinds, value, kind) => kinds.set(kind, -1 * value),
          this._kinds
        ),
        None
      );
    }

    /**
     * @see https://drafts.css-houdini.org/css-typed-om-1/#apply-the-percent-hint
     */
    public apply(hint: Kind.Hint): Kind {
      return new Kind(
        this._kinds
          .set(
            hint,
            this._kinds.get(hint).get() + this._kinds.get("percentage").get()
          )
          .set("percentage", 0),
        Option.of(hint)
      );
    }

    public equals(value: this): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Kind &&
        value._kinds.equals(this._kinds) &&
        value._hint.equals(this._hint)
      );
    }

    public toJSON(): Kind.JSON {
      return {
        kinds: this._kinds.toArray(),
        hint: this._hint.getOr(null),
      };
    }
  }

  export namespace Kind {
    export interface JSON {
      [key: string]: json.JSON;
      kinds: Array<[Base, number]>;
      hint: Hint | null;
    }

    export type Map = Record<
      {
        [K in Base]: number;
      }
    >;

    /**
     * @see https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-base-type
     */
    export type Base =
      | "length"
      | "angle"
      | "time"
      | "frequency"
      | "resolution"
      | "percentage";

    export type Hint = Exclude<Kind.Base, "percentage">;
  }

  export abstract class Expression implements Equatable, Serializable {
    public abstract get type(): string;

    public abstract get kind(): Kind;

    /**
     * @see https://drafts.csswg.org/css-values/#simplify-a-calculation-tree
     */
    public abstract reduce(resolve: Mapper<Numeric>): Expression;

    public toLength(): Option<Length> {
      if (isValueExpression(this) && isLength(this.value)) {
        return Option.of(this.value);
      }

      return None;
    }

    public toPercentage(): Option<Percentage> {
      if (isValueExpression(this) && isPercentage(this.value)) {
        return Option.of(this.value);
      }

      return None;
    }

    public abstract equals(value: unknown): value is this;

    public toJSON(): Expression.JSON {
      return {
        type: this.type,
      };
    }
  }

  export namespace Expression {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
    }
  }

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

      if (isNumber(value) || isInteger(value)) {
        return Kind.of();
      }

      if (isPercentage(value)) {
        return Kind.of("percentage");
      }

      if (isLength(value)) {
        return Kind.of("length");
      }

      if (isAngle(value)) {
        return Kind.of("angle");
      }

      throw new Error(`Invalid value ${value}`);
    }

    public get value(): Numeric {
      return this._value;
    }

    public reduce(resolve: Mapper<Numeric>): Expression {
      const value = this._value;

      if (isLength(value) && value.isAbsolute()) {
        return Value.of(value.withUnit("px"));
      }

      if (isAngle(value)) {
        return Value.of(value.withUnit("deg"));
      }

      return Value.of(resolve(value));
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

  export namespace Value {
    export interface JSON extends Expression.JSON {
      type: "value";
      value: Numeric.JSON;
    }
  }

  export function isValueExpression(
    expression: Expression
  ): expression is Value {
    return expression.type === "value";
  }

  export abstract class Operation<
    O extends Array<Expression> = Array<Expression>
  > extends Expression {
    protected readonly _operands: Readonly<O>;
    protected readonly _kind: Kind;

    protected constructor(operands: Readonly<O>, kind: Kind) {
      super();

      this._operands = operands;
      this._kind = kind;
    }

    public get operands(): Readonly<O> {
      return this._operands;
    }

    public get kind(): Kind {
      return this._kind;
    }

    public equals(value: this): value is this {
      return (
        value instanceof Operation &&
        value.type === this.type &&
        value._operands.length === this._operands.length &&
        value._operands.every((operand, i) => operand.equals(this._operands[i]))
      );
    }

    public toJSON(): Operation.JSON {
      return {
        ...super.toJSON(),
        operands: this._operands.map((operand) => operand.toJSON()),
      };
    }
  }

  export namespace Operation {
    export interface JSON extends Expression.JSON {
      operands: Array<Expression.JSON>;
    }

    export abstract class Unary extends Operation<[Expression]> {
      protected constructor(operands: [Expression], kind: Kind) {
        super(operands, kind);
      }
    }

    export abstract class Binary extends Operation<[Expression, Expression]> {
      protected constructor(operands: [Expression, Expression], kind: Kind) {
        super(operands, kind);
      }
    }
  }

  export class Sum extends Operation.Binary {
    public static of(
      ...operands: [Expression, Expression]
    ): Result<Sum, string> {
      const [fst, snd] = operands;

      const kind = fst.kind.add(snd.kind);

      return kind.map((kind) => new Sum(operands, kind));
    }

    public get type(): "sum" {
      return "sum";
    }

    public reduce(resolve: Mapper<Numeric>): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolve)
      );

      if (isValueExpression(fst) && isValueExpression(snd)) {
        if (isNumber(fst.value) && isNumber(snd.value)) {
          return Value.of(Number.of(fst.value.value + snd.value.value));
        }

        if (isPercentage(fst.value) && isPercentage(snd.value)) {
          return Value.of(Percentage.of(fst.value.value + snd.value.value));
        }

        if (
          isDimension(fst.value) &&
          isDimension(snd.value) &&
          fst.value.unit === snd.value.unit
        ) {
          const { unit } = fst.value;

          if (Unit.isLength(unit)) {
            return Value.of(Length.of(fst.value.value + snd.value.value, unit));
          }

          if (Unit.isAngle(unit)) {
            return Value.of(Angle.of(fst.value.value + snd.value.value, unit));
          }
        }
      }

      return new Sum([fst, snd], this._kind);
    }

    public toString(): string {
      const [fst, snd] = this._operands;

      if (isNegateExpression(snd)) {
        return `(${fst} - ${snd.operands[0]})`;
      }

      return `(${fst} + ${snd})`;
    }
  }

  export function isSumExpression(expression: Expression): expression is Sum {
    return expression.type === "sum";
  }

  export class Negate extends Operation.Unary {
    public static of(operand: Expression): Negate {
      return new Negate([operand], operand.kind);
    }

    public get type(): "negate" {
      return "negate";
    }

    public reduce(resolve: Mapper<Numeric>): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolve)
      );

      if (isValueExpression(operand)) {
        const { value } = operand;

        if (isNumber(value)) {
          return Value.of(Number.of(0 - value.value));
        }

        if (isInteger(value)) {
          return Value.of(Integer.of(0 - value.value));
        }

        if (isPercentage(value)) {
          return Value.of(Percentage.of(0 - value.value));
        }

        if (isLength(value)) {
          return Value.of(Length.of(0 - value.value, value.unit));
        }

        if (isAngle(value)) {
          return Value.of(Angle.of(0 - value.value, value.unit));
        }
      }

      if (isNegateExpression(operand)) {
        return operand._operands[0];
      }

      return Negate.of(operand);
    }

    public toString(): string {
      const [operand] = this._operands;

      return `(-1 * ${operand})`;
    }
  }

  export function isNegateExpression(
    expression: Expression
  ): expression is Negate {
    return expression.type === "negate";
  }

  export class Product extends Operation.Binary {
    public static of(
      ...operands: [Expression, Expression]
    ): Result<Product, string> {
      const [fst, snd] = operands;

      const kind = fst.kind.multiply(snd.kind);

      return kind.map((kind) => new Product(operands, kind));
    }

    public get type(): "product" {
      return "product";
    }

    public reduce(resolve: Mapper<Numeric>): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolve)
      );

      if (isValueExpression(fst) && isValueExpression(snd)) {
        let multipler: number | undefined;
        let value!: Numeric;

        if (isNumber(fst.value)) {
          multipler = fst.value.value;
          value = snd.value;
        } else if (isNumber(snd.value)) {
          multipler = snd.value.value;
          value = fst.value;
        }

        if (multipler !== undefined) {
          if (isNumber(value)) {
            return Value.of(Number.of(multipler * value.value));
          }

          if (isPercentage(value)) {
            return Value.of(Percentage.of(multipler * value.value));
          }

          if (isLength(value)) {
            return Value.of(Length.of(multipler * value.value, value.unit));
          }

          if (isAngle(value)) {
            return Value.of(Angle.of(multipler * value.value, value.unit));
          }
        }
      }

      return new Product([fst, snd], this._kind);
    }

    public toString(): string {
      const [fst, snd] = this._operands;

      return `${fst} * ${snd}`;
    }
  }

  export function isProductExpression(
    expression: Expression
  ): expression is Product {
    return expression.type === "product";
  }

  export class Invert extends Operation.Unary {
    public static of(operand: Expression): Invert {
      return new Invert([operand], operand.kind.invert());
    }

    public get type(): "invert" {
      return "invert";
    }

    public get kind(): Kind {
      return this._operands[0].kind.invert();
    }

    public reduce(resolve: Mapper<Numeric>): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolve)
      );

      if (isValueExpression(operand)) {
        const { value } = operand;

        if (isNumber(value)) {
          return Value.of(Number.of(1 / value.value));
        }
      }

      if (isInvertExpression(operand)) {
        return operand._operands[0];
      }

      return Negate.of(operand);
    }

    public toString(): string {
      const [operand] = this._operands;

      return `(1 / ${operand})`;
    }
  }

  export function isInvertExpression(
    expression: Expression
  ): expression is Invert {
    return expression.type === "invert";
  }

  let parseSum: Parser<Slice<Token>, Expression, string>;

  const parseCalc = map(
    Function.parse("calc", (input) => parseSum(input)),
    ([, expression]) => expression
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-value
   */
  const parseValue = either<Slice<Token>, Expression, string>(
    map(
      either<Slice<Token>, Numeric, string>(
        Number.parse,
        Percentage.parse,
        Length.parse,
        Angle.parse
      ),
      Value.of
    ),
    parseCalc,
    delimited(
      Token.parseOpenParenthesis,
      (input) => parseSum(input),
      Token.parseCloseParenthesis
    )
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-product
   */
  const parseProduct = flatMap(
    pair(
      parseValue,
      option(
        pair(
          delimited(
            option(Token.parseWhitespace),
            either(
              map(Token.parseDelim("*"), () => false),
              map(Token.parseDelim("/"), () => true)
            )
          ),
          parseValue
        )
      )
    ),
    ([left, result]) => {
      const right = result.map(([invert, right]) =>
        invert ? Invert.of(right) : right
      );

      if (right.isNone()) {
        return (input) => Result.of([input, left]);
      }

      return (input) =>
        Product.of(left, right.get()).map((expression) => [input, expression]);
    }
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-sum
   */
  parseSum = flatMap(
    pair(
      parseProduct,
      option(
        pair(
          delimited(
            Token.parseWhitespace,
            either(
              map(Token.parseDelim("+"), () => false),
              map(Token.parseDelim("-"), () => true)
            )
          ),
          parseProduct
        )
      )
    ),
    ([left, result]) => {
      const right = result.map(([negate, right]) =>
        negate ? Negate.of(right) : right
      );

      if (right.isNone()) {
        return (input) => Result.of([input, left]);
      }

      return (input) =>
        Sum.of(left, right.get()).map((expression) => [input, expression]);
    }
  );

  export const parse = map(parseCalc, Calculation.of);
}
