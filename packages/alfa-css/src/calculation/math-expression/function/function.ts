import { Array } from "@siteimprove/alfa-array";

import { Expression } from "../expression.js";
import type { Kind } from "../kind.js";

/**
 * @public
 */
export abstract class Function<
  T extends string = string,
  A extends Array<Expression> = Array<Expression>,
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
        arg.equals(this._args[i]),
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
}
