import { Hash } from "@siteimprove/alfa-hash";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";

import { Value as CSSValue } from "../../value";
import {
  Angle,
  Dimension,
  Length,
  Number,
  Numeric,
  Percentage,
} from "../numeric";
import { Unit } from "../unit";

import { Expression } from "./expression";
import { Kind } from "./kind";
import { Value } from "./value";

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
  out D extends Calculation.Dimension = Calculation.Dimension
> extends CSSValue<"calculation"> {
  public static of(expression: Expression): Calculation {
    return new Calculation(
      expression.reduce({
        length: (value) => value,
        percentage: (value) => value,
      })
    );
  }

  private readonly _expression: Expression;

  private constructor(expression: Expression) {
    super();

    this._expression = expression;
  }

  public get type(): "calculation" {
    return "calculation";
  }

  public get expression(): Expression {
    return this._expression;
  }

  public reduce(resolver: Expression.Resolver): Calculation {
    return new Calculation(this._expression.reduce(resolver));
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isDimension<D extends Numeric.Dimension>(
    dimension: D
  ): this is Calculation<D> {
    return this._expression.kind.is(dimension);
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isDimensionPercentage<D extends Numeric.Dimension>(
    dimension: D
  ): this is Calculation<`${D}-percentage`> {
    return (
      // dimension-percentage are not just (dimension | percentage) because the
      // dimension does accept a percent hint in this case; while pure
      // dimensions may not be hinted.
      this._expression.kind.is(dimension, 1, true) ||
      this._expression.kind.is("percentage")
    );
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isNumber(): this is Calculation<"number"> {
    return this._expression.kind.is();
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isPercentage(): this is Calculation<"percentage"> {
    return this._expression.kind.is("percentage");
  }

  // Other resolvers should be added when needed.
  /**
   * Resolves a calculation typed as a length, length-percentage or number.
   * Needs a resolver to handle relative lengths and percentages.
   */
  public resolve(
    this: Calculation<"length">,
    resolver: Expression.LengthResolver
  ): Option<Length<"px">>;

  public resolve(
    this: Calculation<"length-percentage">,
    resolver: Expression.Resolver<"px", Length<"px">>
  ): Option<Length<"px">>;

  public resolve(
    this: Calculation<"number">,
    resolver: Expression.PercentageResolver
  ): Option<Number>;

  public resolve(
    this: Calculation,
    resolver: Expression.Resolver<"px", Length<"px">>
  ): Option<Numeric> {
    // Since the expressions can theoretically contain arbitrarily units in them,
    // e.g. calc(1px * (3 deg / 1 rad)) is a length (even though in practice
    // they seem to be more restricted), we can't easily type Expression itself
    // (other than with its Kind).
    const expression = this._expression.reduce(resolver);

    return this.isDimensionPercentage("length")
      ? // length are also length-percentage, so this catches both.
        expression.toLength()
      : this.isNumber()
      ? expression.toNumber()
      : None;
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
  export type Dimension =
    | Kind.Base
    | `${Numeric.Dimension}-percentage`
    | "number";

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
      resolver: Expression.Resolver<L, P>
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver)
      );

      if (Value.isValueExpression(fst) && Value.isValueExpression(snd)) {
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
      resolver: Expression.Resolver<L, P>
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver)
      );

      if (Value.isValueExpression(operand)) {
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
      resolver: Expression.Resolver<L, P>
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver)
      );

      if (Value.isValueExpression(fst) && Value.isValueExpression(snd)) {
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
      resolver: Expression.Resolver<L, P>
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver)
      );

      if (Value.isValueExpression(operand)) {
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

      if (right.isSome()) {
        return (input) =>
          Product.of(left, right.get()).map((expression) => [
            input,
            expression,
          ]);
      }

      return (input) => Result.of([input, left]);
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

      if (right.isSome()) {
        return (input) =>
          Sum.of(left, right.get()).map((expression) => [input, expression]);
      }
      return (input) => Result.of([input, left]);
    }
  );

  export const parse = map(parseCalc, Calculation.of);

  // other parsers + filters can be added when needed
  export const parseLength = filter(
    parse,
    (calculation): calculation is Calculation<"length"> =>
      calculation.isDimension("length"),
    () => `calc() expression must be of type "length"`
  );

  export const parseLengthPercentage = filter(
    parse,
    (calculation): calculation is Calculation<"length-percentage"> =>
      calculation.isDimensionPercentage("length"),
    () => `calc() expression must be of type "length" or "percentage"`
  );

  export const parseLengthNumberPercentage = filter(
    parse,
    (
      calculation
    ): calculation is
      | Calculation<"length-percentage">
      | Calculation<"number"> =>
      calculation.isDimensionPercentage("length") || calculation.isNumber(),
    () => `calc() expression must be of type "length" or "percentage"`
  );
}
