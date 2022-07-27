import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import { Slice } from "@siteimprove/alfa-slice";
import { Record } from "@siteimprove/alfa-record";
import { Result, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";
import { Function } from "../syntax/function";

import { Value } from "../value";
import {
  Angle,
  Dimension,
  Length,
  Number,
  Numeric,
  Percentage,
} from "./numeric";
import { Unit } from "./unit";

const { delimited, either, filter, flatMap, map, option, pair } = Parser;

const { isAngle } = Angle;
const { isDimension } = Dimension;
const { isLength } = Length;
const { isNumber } = Number;
const { isPercentage } = Percentage;

/**
 * {@link https://drafts.csswg.org/css-values/#math}
 *
 * @public
 */
export class Calculation<
  D extends Calculation.Dimension = "unknown"
> extends Value<"calculation"> {
  public static of(expression: Calculation.Expression): Calculation {
    return new Calculation(
      expression.reduce({
        length: (value) => value,
        percentage: (value) => value,
      })
    );
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

  public reduce(resolver: Calculation.Resolver): Calculation {
    return new Calculation(this._expression.reduce(resolver));
  }

  // Other matchers should be added when needed.
  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isLength(): this is Calculation<"length"> {
    return this._expression.kind.is("length");
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isNumber(): this is Calculation<"scalar"> {
    return this._expression.kind.is();
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isPercentage(): this is Calculation<"percentage"> {
    return this._expression.kind.is("percentage");
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isLengthPercentage(): this is Calculation<"length" | "percentage"> {
    return (
      // dimension-percentage are not just (dimension | percentage) because the
      // dimension does accept a percent hint in this case; while pure
      // dimensions may not be hinted.
      this._expression.kind.is("length", 1, true) ||
      this._expression.kind.is("percentage")
    );
  }

  // Other resolvers should be added when needed.
  /**
   * Resolves a calculation typed as a length or percentage into an absolute length.
   * Needs a resolver to handle relative lengths and percentages.
   */
  public resolve(
    this: Calculation<"length" | "percentage">,
    resolver: Calculation.Resolver<"px", Length<"px">>
  ): Length<"px"> {
    // Since the expressions can theoretically contain arbitrarily units in them,
    // e.g. calc(1px * (3 deg / 1 rad)) is a length (even though in practice
    // they seem to be more restricted), we can't easily type Expression itself
    // (other than with its Kind).
    // However, we now that a calculation matching <length-percentage> can be
    // resolved to a Length<"px"> with certainty if the correct individual
    // resolvers are provided.
    return this._expression.reduce(resolver).toLength().get() as Length<"px">;
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

/**
 * @public
 */
export namespace Calculation {
  export interface JSON {
    [key: string]: json.JSON;
    type: "calculation";
    expression: Expression.JSON;
  }

  export function isCalculation(value: unknown): value is Calculation {
    return value instanceof Calculation;
  }

  /**
   * @internal
   */
  export type Dimension = Kind.Base | "scalar" | "unknown";

  /**
   * Absolute units can be resolved automatically.
   * Relative lengths and percentages need some help.
   *
   * @internal
   */
  export interface Resolver<
    L extends Unit.Length = "px",
    P extends Numeric = Numeric
  > {
    length(value: Length<Unit.Length.Relative>): Length<L>;
    percentage(value: Percentage): P;
  }

  function angleResolver(angle: Angle): Angle<"deg"> {
    return angle.withUnit("deg");
  }

  function lengthResolver<U extends Unit.Length = "px">(
    resolver: Mapper<Length<Unit.Length.Relative>, Length<U>>
  ): Mapper<Length, Length<"px"> | Length<U>> {
    return (length) =>
      length.isRelative() ? resolver(length) : length.withUnit("px");
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#numeric-typing}
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

    /**
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
     */
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
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-add-two-types}
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
        for (const hint of ["length", "angle"] as const) {
          const kind = a.apply(hint);

          if (kind._kinds.equals(b.apply(hint)._kinds)) {
            return Result.of(kind);
          }
        }
      }

      return Err.of(`Cannot add types ${a} and ${b}`);
    }

    /**
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-multiply-two-types}
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
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-invert-a-type}
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
     * {@link https://drafts.css-houdini.org/css-typed-om/#apply-the-percent-hint}
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

    export function isKind(value: unknown): value is Kind {
      return value instanceof Kind;
    }

    /**
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-type}
     */
    export type Map = Record<{
      [K in Base]: number;
    }>;

    /**
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-base-type}
     */
    export type Base = Numeric.Dimension | "percentage";

    /**
     * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-percent-hint}
     */
    export type Hint = Exclude<Kind.Base, "percentage">;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#calculation-tree}
   */
  export abstract class Expression implements Equatable, Serializable {
    public abstract get type(): string;

    public abstract get kind(): Kind;

    /**
     * {@link https://drafts.csswg.org/css-values/#simplify-a-calculation-tree}
     */
    public abstract reduce<
      L extends Unit.Length = "px",
      P extends Numeric = Numeric
    >(resolver: Resolver<L, P>): Expression;

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

    /**
     * {@link https://drafts.csswg.org/css-values/#serialize-a-calculation-tree}
     */
    public abstract toString(): string;
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
      resolver: Resolver<L, P>
    ): Value {
      return Value.of(
        Selective.of(this._value)
          .if(isLength, lengthResolver(resolver.length))
          .if(isAngle, angleResolver)
          .if(isPercentage, resolver.percentage)
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

  export namespace Value {
    export interface JSON extends Expression.JSON {
      type: "value";
      value: Numeric.JSON;
    }
  }

  export function isValueExpression(value: unknown): value is Value {
    return value instanceof Value;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#calculation-tree-operator-nodes}
   */
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

    public equals(value: Operation<O>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Operation &&
        value.type === this.type &&
        value._operands.length === this._operands.length &&
        value._operands.every((operand: Expression, i: number) =>
          operand.equals(this._operands[i])
        )
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

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Resolver<L, P>
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver)
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

  export function isSumExpression(value: unknown): value is Sum {
    return value instanceof Sum;
  }

  export class Negate extends Operation.Unary {
    public static of(operand: Expression): Negate {
      return new Negate([operand], operand.kind);
    }

    public get type(): "negate" {
      return "negate";
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Resolver<L, P>
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver)
      );

      if (isValueExpression(operand)) {
        const { value } = operand;

        if (isNumber(value)) {
          return Value.of(Number.of(0 - value.value));
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

  export function isNegateExpression(value: unknown): value is Negate {
    return value instanceof Negate;
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

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Resolver<L, P>
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver)
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

  export function isProductExpression(value: unknown): value is Product {
    return value instanceof Product;
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

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Resolver<L, P>
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver)
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

  export function isInvertExpression(value: unknown): value is Invert {
    return value instanceof Invert;
  }

  let parseSum: Parser<Slice<Token>, Expression, string>;

  const parseCalc = map(
    Function.parse("calc", (input) => parseSum(input)),
    ([, expression]) => expression
  );

  /**
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-value}
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
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-product}
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
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-sum}
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

  // other parsers + filters can be added when needed
  export const parseLengthPercentage = filter(
    parse,
    (calculation) => calculation.isLengthPercentage(),
    () => `calc() expression must be of type "length" or "percentage"`
  );
}
