import { Array } from "@siteimprove/alfa-array";
import { Numeric } from "../numeric/numeric";
import { Unit } from "../unit/unit";

import { Expression } from "./expression";
import { Kind } from "./kind";
import { Value } from "./value";

const { isValueExpression } = Value;

/**
 * @public
 */
export abstract class Function<
  T extends string = string,
  A extends Array<Expression> = Array<Expression>
> extends Expression<T> {
  protected readonly _args: Readonly<A>;
  protected readonly _kind: Kind;

  protected constructor(type: T, args: Readonly<A>, kind: Kind) {
    super(type, kind);

    this._args = args;
    this._kind = kind;
  }

  public get args(): Readonly<A> {
    return this._args;
  }

  public equals(value: Function<T, A>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Function &&
      value.type === this.type &&
      value._args.length === this._args.length &&
      value._args.every((arg: Expression, i: number) =>
        arg.equals(this._args[i])
      )
    );
  }

  public toJSON(): Function.JSON<T> {
    return { ...super.toJSON(), arguments: Array.toJSON(this._args) };
  }
}

/**
 * @public
 */
export namespace Function {
  export interface JSON<T extends string = string> extends Expression.JSON<T> {
    arguments: Array<Expression.JSON>;
  }

  export class Calculation extends Function<"calculation", [Expression]> {
    public static of(expression: Expression): Calculation {
      return new Calculation([expression], expression.kind);
    }

    private constructor(args: [Expression], kind: Kind) {
      super("calculation", args, kind);
    }

    public reduce<L extends Unit.Length = "px", P extends Numeric = Numeric>(
      resolver: Expression.Resolver<L, P>
    ): Expression {
      const reduced = this._args[0].reduce(resolver);

      // If the calculation reduces to a value, no need to keep
      // the `calc()` wrapper.
      return isValueExpression(reduced) ? reduced : Calculation.of(reduced);
    }

    public toString(): string {
      return `calc(${this._args[0]})`;
    }
  }

  export function isCalculation(value: unknown): value is Calculation {
    return value instanceof Calculation;
  }
}
