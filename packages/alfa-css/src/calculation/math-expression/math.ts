import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Err, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import {
  Function as CSSFunction,
  Token,
  type Parser as CSSParser,
} from "../../syntax";

import { Angle, Length, Number, Numeric, Percentage } from "../numeric";

import { Expression } from "./expression";
import { Function } from "./function";
import { Kind } from "./kind";
import { Operation } from "./operation";
import { Value } from "./value";

const {
  delimited,
  either,
  filter,
  map,
  mapResult,
  option,
  pair,
  separatedList,
  zeroOrMore,
} = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#math}
 *
 * @public
 */
export class Math<out D extends Math.Dimension = Math.Dimension> {
  public static of(expression: Expression): Math {
    return new Math(
      expression.reduce({
        length: (value) => value,
        percentage: (value) => value,
      }),
    );
  }

  private readonly _expression: Expression;
  private readonly _type = "math expression";

  private constructor(expression: Expression) {
    this._expression = expression;
  }

  public get expression(): Expression {
    return this._expression;
  }

  public get type(): "math expression" {
    return this._type;
  }

  public reduce(resolver: Expression.Resolver): Math {
    return new Math(this._expression.reduce(resolver));
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isDimension<D extends Numeric.Dimension>(
    dimension: D,
  ): this is Math<D> {
    return this._expression.kind.is(dimension);
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isDimensionPercentage<D extends Numeric.Dimension>(
    dimension: D,
  ): this is Math<`${D}-percentage`> {
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
  public isNumber(): this is Math<"number"> {
    return this._expression.kind.is();
  }

  /**
   * {@link https://drafts.css-houdini.org/css-typed-om/#cssnumericvalue-match}
   */
  public isPercentage(): this is Math<"percentage"> {
    return this._expression.kind.is("percentage");
  }

  // Other resolvers should be added when needed.
  /**
   * Resolves a calculation typed as an angle, length, length-percentage or number.
   * Needs a resolver to handle relative lengths and percentages.
   */
  public resolve(this: Math<"angle">): Result<Angle<"deg">, string>;

  public resolve(
    this: Math<"angle-percentage">,
    resolver: Expression.PercentageResolver<Angle<"deg">>,
  ): Result<Angle<"deg">, string>;

  public resolve(
    this: Math<"length">,
    resolver: Expression.LengthResolver,
  ): Result<Length<"px">, string>;

  public resolve(
    this: Math<"length-percentage">,
    resolver: Expression.Resolver<"px", Length<"px">>,
  ): Result<Length<"px">, string>;

  public resolve(this: Math<"number">): Result<Number, string>;

  public resolve<T extends Numeric = Percentage>(
    this: Math<"percentage">,
    resolver?: Expression.PercentageResolver<T>,
    hint?: T extends Angle ? "angle" : "length",
  ): Result<T, string>;

  public resolve<T extends Numeric>(
    this: Math,
    resolver?:
      | Expression.LengthResolver
      | Expression.Resolver<"px", Length<"px">>
      | Expression.PercentageResolver<T>,
    hint?: T extends Angle ? "angle" : "length",
  ): Result<Numeric, string> {
    // Since the expressions can theoretically contain arbitrarily units in them,
    // e.g. calc(1px * (3 deg / 1 rad)) is a length (even though in practice
    // they seem to be more restricted), we can't easily type Expression itself
    // (other than with its Kind).
    try {
      const expression = this._expression.reduce<
        "px",
        Angle<"deg"> | Length<"px"> | Percentage | T
      >({
        // If the expression is a length, and we can't resolve relative lengths,
        // abort.
        length: () => {
          throw new Error(`Missing length resolver for ${this}`);
        },
        // If the expression is a percentage and we can't resolve percentages,
        // we keep them as percentages.
        percentage: (p) => p,
        ...resolver,
      });

      // Pure percentages can be resolved as any dimension (or stay as percentage)
      // We need a hint, provided by the context, in order to know what type of
      // value to convert to afterward.
      if (this.isPercentage()) {
        const converters = {
          angle: "toAngle",
          length: "toLength",
        } as const;
        // If no resolver was provided, percentages must stay as percentages
        return expression[
          resolver === undefined || hint === undefined
            ? "toPercentage"
            : converters[hint]
        ]();
      }

      return this.isDimensionPercentage("angle")
        ? // angle are also angle-percentage, so this catches both.
          expression.toAngle()
        : this.isDimensionPercentage("length")
        ? // length are also length-percentage, so this catches both.
          expression.toLength()
        : this.isNumber()
        ? expression.toNumber()
        : Err.of(`${this} does not resolve to a valid expression`);
    } catch (e) {
      if (e instanceof Error) {
        return Err.of(e.message);
      } else {
        return Err.of(
          `Unexpected error while resolving math expression ${this}`,
        );
      }
    }
  }

  public hash(hash: Hash): void {}

  public equals(value: unknown): value is this {
    return value instanceof Math && value._expression.equals(this._expression);
  }

  public toJSON(): Math.JSON {
    return {
      type: "math expression",
      expression: this._expression.toJSON(),
    };
  }

  public toString(): string {
    return this._expression.toString();
  }
}

/**
 * @public
 */
export namespace Math {
  export interface JSON {
    [key: string]: json.JSON;
    type: "math expression";
    expression: Expression.JSON;
  }

  export function isCalculation(value: unknown): value is Math {
    return value instanceof Math;
  }

  export function isNumber(value: unknown): value is Math<"number"> {
    return isCalculation(value) && value.isNumber();
  }

  export function isPercentage(value: unknown): value is Math<"percentage"> {
    return isCalculation(value) && value.isPercentage();
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

  let parseSum: CSSParser<Expression>;

  const parseCalc = map(
    CSSFunction.parse("calc", (input) => parseSum(input)),
    ([, expression]) => Function.Calculation.of(expression),
  );

  const parseMax = mapResult(
    CSSFunction.parse("max", (input) =>
      separatedList(
        parseSum,
        delimited(option(Token.parseWhitespace), Token.parseComma),
      )(input),
    ),
    ([, args]) => Function.Max.of(...args),
  );

  const parseFunction = either(parseCalc, parseMax);

  /**
   * {@link https://drafts.csswg.org/css-values/#typedef-calc-value}
   */
  const parseValue = either<Slice<Token>, Expression, string>(
    map(
      either<Slice<Token>, Numeric, string>(
        Number.parse,
        Percentage.parse,
        Length.parse,
        Angle.parse,
      ),
      Value.of,
    ),
    parseFunction,
    delimited(
      Token.parseOpenParenthesis,
      (input) => parseSum(input),
      Token.parseCloseParenthesis,
    ),
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
              map(Token.parseDelim("/"), () => true),
            ),
          ),
          parseValue,
        ),
      ),
    ),
    ([left, result]) =>
      result
        .map(([invert, right]) => (invert ? Operation.Invert.of(right) : right))
        .reduce(
          (left: Result<Expression, string>, right: Expression) =>
            left.flatMap((left) => Operation.Product.of(left, right)),
          Result.of(left),
        ),
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
              map(Token.parseDelim("-"), () => true),
            ),
          ),
          parseProduct,
        ),
      ),
    ),
    ([left, result]) =>
      result
        .map(([invert, right]) => (invert ? Operation.Negate.of(right) : right))
        .reduce(
          (left: Result<Expression, string>, right: Expression) =>
            left.flatMap((left) => Operation.Sum.of(left, right)),
          Result.of(left),
        ),
  );

  export const parse = map(parseFunction, Math.of);

  // other parsers + filters can be added when needed
  export const parseAngle = filter(
    parse,
    (calculation): calculation is Math<"angle"> =>
      calculation.isDimension("angle"),
    () => `calc() expression must be of type "angle"`,
  );

  export const parseAnglePercentage = filter(
    parse,
    (calculation): calculation is Math<"angle-percentage"> =>
      calculation.isDimensionPercentage("angle"),
    () => `calc() expression must be of type "angle" or "percentage"`,
  );

  export const parseLength = filter(
    parse,
    (calculation): calculation is Math<"length"> =>
      calculation.isDimension("length"),
    () => `calc() expression must be of type "length"`,
  );

  export const parseLengthPercentage = filter(
    parse,
    (calculation): calculation is Math<"length-percentage"> =>
      calculation.isDimensionPercentage("length"),
    () => `calc() expression must be of type "length" or "percentage"`,
  );

  export const parseNumber = filter(
    parse,
    (calculation): calculation is Math<"number"> => calculation.isNumber(),
    () => `calc() expression must be of type "number"`,
  );

  export const parsePercentage = filter(
    parse,
    (calculation): calculation is Math<"percentage"> =>
      calculation.isPercentage(),
    () => `calc() expression must be of type "percentage"`,
  );
}
