import { Result } from "@siteimprove/alfa-result";

import {
  Angle,
  Dimension,
  Length,
  Number,
  Numeric,
  Percentage,
} from "../numeric";
import { Unit } from "../unit/unit";

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

/**
 * @public
 */
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

  export class Sum extends Binary {
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

  export class Negate extends Operation {
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

  export class Product extends Operation {
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

  export class Invert extends Operation {
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
}
