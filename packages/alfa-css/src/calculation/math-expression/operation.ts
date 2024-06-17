import { Array } from "@siteimprove/alfa-array";
import { Result } from "@siteimprove/alfa-result";

import {
  Angle,
  Dimension,
  Length,
  Number,
  Numeric,
  Percentage,
} from "../numeric";

import { Unit } from "../../unit";

import { Expression } from "./expression";
import { Kind } from "./kind";
import { Value } from "./value";

const { isAngle } = Angle;
const { isDimension } = Dimension;
const { isLength } = Length;
const { isNumber } = Number;
const { isPercentage } = Percentage;

/**
 * {@link https://drafts.csswg.org/css-values/#calculation-tree-operator-nodes}
 *
 * @public
 */
export abstract class Operation<
  T extends string = string,
  O extends Array<Expression> = Array<Expression>,
> extends Expression<T> {
  protected readonly _operands: Readonly<O>;

  protected constructor(type: T, operands: Readonly<O>, kind: Kind) {
    super(type, kind);

    this._operands = operands;
  }

  public get operands(): Readonly<O> {
    return this._operands;
  }

  public equals(value: Operation<T, O>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Operation &&
      value._type === this._type &&
      value._operands.length === this._operands.length &&
      value._operands.every((operand: Expression, i: number) =>
        operand.equals(this._operands[i]),
      )
    );
  }

  public toJSON(): Operation.JSON<T> {
    return { ...super.toJSON(), operands: Array.toJSON(this._operands) };
  }
}

/**
 * @public
 */
export namespace Operation {
  export interface JSON<T extends string = string> extends Expression.JSON<T> {
    operands: Array<Expression.JSON>;
  }

  export abstract class Unary<T extends string = string> extends Operation<
    T,
    [Expression]
  > {
    protected constructor(type: T, operands: [Expression], kind: Kind) {
      super(type, operands, kind);
    }
  }

  export abstract class Binary<T extends string = string> extends Operation<
    T,
    [Expression, Expression]
  > {
    protected constructor(
      type: T,
      operands: [Expression, Expression],
      kind: Kind,
    ) {
      super(type, operands, kind);
    }
  }

  export class Sum extends Binary<"sum"> {
    public static of(
      ...operands: [Expression, Expression]
    ): Result<Sum, string> {
      const [fst, snd] = operands;

      const kind = fst.kind.add(snd.kind);

      return kind.map((kind) => new Sum(operands, kind));
    }
    private constructor(operands: [Expression, Expression], kind: Kind) {
      super("sum", operands, kind);
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Expression.Resolver<L, P>,
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver),
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

  export class Negate extends Unary<"negate"> {
    public static of(operand: Expression): Negate {
      return new Negate([operand], operand.kind);
    }

    private constructor(operand: [Expression], kind: Kind) {
      super("negate", operand, kind);
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Expression.Resolver<L, P>,
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver),
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

  export class Product extends Binary<"product"> {
    public static of(
      ...operands: [Expression, Expression]
    ): Result<Product, string> {
      const [fst, snd] = operands;

      const kind = fst.kind.multiply(snd.kind);

      return kind.map((kind) => new Product(operands, kind));
    }

    private constructor(operands: [Expression, Expression], kind: Kind) {
      super("product", operands, kind);
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Expression.Resolver<L, P>,
    ): Expression {
      const [fst, snd] = this._operands.map((operand) =>
        operand.reduce(resolver),
      );

      // Both operands are fully resolved values. If one of them is a number, we
      // can resolve the other.
      if (Value.isValueExpression(fst) && Value.isValueExpression(snd)) {
        return Product.ofValues(fst, snd);
      }

      // One operand is a value, the other is an Invert. We might be able to
      // reduce the fraction if the dimensions match.
      // When the denominator is a dimensionless number, it should already have
      // been reduced.
      if (Value.isValueExpression(fst) && isInvertExpression(snd)) {
        return Product.ofRatio(fst, snd, resolver);
      }

      if (isInvertExpression(fst) && Value.isValueExpression(snd)) {
        return Product.ofRatio(snd, fst, resolver);
      }

      return new Product([fst, snd], this._kind);
    }

    public toString(): string {
      const [fst, snd] = this._operands;

      return `${fst} * ${snd}`;
    }
  }

  export namespace Product {
    /**
     * @internal
     */
    export function ofValues(
      fst: Value<Numeric>,
      snd: Value<Numeric>,
    ): Expression {
      let multiplier: number | undefined;
      let value!: Numeric;

      if (isNumber(fst.value)) {
        multiplier = fst.value.value;
        value = snd.value;
      } else if (isNumber(snd.value)) {
        multiplier = snd.value.value;
        value = fst.value;
      }

      if (multiplier !== undefined) {
        if (isNumber(value)) {
          return Value.of(Number.of(multiplier * value.value));
        }

        if (isPercentage(value)) {
          return Value.of(Percentage.of(multiplier * value.value));
        }

        if (isLength(value)) {
          return Value.of(Length.of(multiplier * value.value, value.unit));
        }

        if (isAngle(value)) {
          return Value.of(Angle.of(multiplier * value.value, value.unit));
        }
      }

      return Product.of(fst, snd).getUnsafe();
    }

    /**
     * @remarks
     * If the denominator is a dimensionless number, it should already have
     * been simplified. So we assume here that the denominator has dimension.
     *  If it is the same dimension as the numerator, we can simplify the ratio
     *  to a number.
     *
     * @internal
     */
    export function ofRatio<
      L extends Unit.Length = "px",
      P extends Numeric = Numeric,
    >(
      numerator: Value<Numeric>,
      denominator: Invert,
      resolver: Expression.Resolver<L, P>,
    ): Expression {
      const num = numerator.value;
      const [y] = denominator.operands;

      if (Value.isValueExpression(y)) {
        const den = y.value;

        if (isLength(num) && isLength(den)) {
          // If we have a resolver that correctly handles both units, we can
          // reduce the fraction.
          const [numR, denR] = [num, den].map(
            Value.lengthResolver(resolver.length),
          );

          if (numR.unit === denR.unit) {
            return Value.of(Number.of(numR.value / denR.value));
          }
        }

        if (isAngle(num) && isAngle(den)) {
          // Angles can always be resolved.
          return Value.of(
            Number.of(
              Value.angleResolver(num).value / Value.angleResolver(den).value,
            ),
          );
        }
      }

      return Product.of(numerator, denominator).getUnsafe();
    }
  }

  export function isProductExpression(value: unknown): value is Product {
    return value instanceof Product;
  }

  export class Invert extends Unary<"invert"> {
    public static of(operand: Expression): Invert {
      return new Invert([operand], operand.kind.invert());
    }

    private constructor(operand: [Expression], kind: Kind) {
      super("invert", operand, kind);
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Expression.Resolver<L, P>,
    ): Expression {
      const [operand] = this._operands.map((operand) =>
        operand.reduce(resolver),
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

      return Invert.of(operand);
    }

    public toString(): string {
      const [operand] = this._operands;

      return `(1 / ${operand})`;
    }
  }

  export function isInvertExpression(value: unknown): value is Invert {
    return value instanceof Invert;
  }
}
