import { Hash } from "@siteimprove/alfa-hash";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";

import { Value as CSSValue } from "../../value";
import { Angle, Length, Number, Numeric, Percentage } from "../numeric";

import { Expression } from "./expression";
import { Kind } from "./kind";
import { Operation } from "./operation";
import { Value } from "./value";

const {
  delimited,
  either,
  filter,
  flatMap,
  map,
  mapResult,
  option,
  pair,
  zeroOrMore,
} = Parser;

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

  // Due to possibility of recursive expressions (`calc(1 + calc(2+3) )`), parsers
  // are mutually recursive and must be kept together here rather than distributed
  // in the corresponding files.

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
  const parseProduct = mapResult(
    pair(
      parseValue,
      zeroOrMore(
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
    ([left, result]) =>
      result
        .map(([invert, right]) => (invert ? Operation.Invert.of(right) : right))
        .reduce(
          (left: Result<Expression, string>, right: Expression) =>
            left.flatMap((left) => Operation.Product.of(left, right)),
          Result.of(left)
        )
  );

  /**
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-sum}
   */
  parseSum = mapResult(
    pair(
      parseProduct,
      zeroOrMore(
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
    ([left, result]) =>
      result
        .map(([invert, right]) => (invert ? Operation.Negate.of(right) : right))
        .reduce(
          (left: Result<Expression, string>, right: Expression) =>
            left.flatMap((left) => Operation.Sum.of(left, right)),
          Result.of(left)
        )
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
