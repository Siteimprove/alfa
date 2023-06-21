import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Unit } from "../../unit";

import { Angle, Length, Number, Numeric, Percentage } from "../numeric";

import { Kind } from "./kind";

/**
 * {@link https://drafts.csswg.org/css-values/#calculation-tree}
 *
 * @public
 */
export abstract class Expression<T extends string = string>
  implements Equatable, Serializable
{
  protected readonly _type: T;
  protected readonly _kind: Kind;

  protected constructor(type: T, kind: Kind) {
    this._type = type;
    this._kind = kind;
  }

  public get type(): T {
    return this._type;
  }

  public get kind(): Kind {
    return this._kind;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#simplify-a-calculation-tree}
   */
  public abstract reduce<
    L extends Unit.Length = "px",
    P extends Numeric = Numeric
  >(resolver: Expression.Resolver<L, P>): Expression;

  public toAngle(): Result<Angle, string> {
    return Err.of(`${this} is not a reduced angle`);
  }

  public toLength(): Result<Length, string> {
    return Err.of(`${this} is not a reduced length`);
  }

  public toNumber(): Result<Number, string> {
    return Err.of(`${this} is not a reduced number`);
  }

  public toPercentage(): Result<Percentage, string> {
    return Err.of(`${this} is not a reduced percentage`);
  }

  public abstract equals(value: unknown): value is this;

  public toJSON(): Expression.JSON<T> {
    return {
      type: this.type,
    };
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#serialize-a-calculation-tree}
   */
  public abstract toString(): string;
}

/**
 * @public
 */
export namespace Expression {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
  }

  /**
   * Absolute units can be resolved automatically.
   * Relative lengths and percentages need some help.
   *
   * @internal
   */
  export interface LengthResolver<L extends Unit.Length = "px"> {
    length(value: Length<Unit.Length.Relative>): Length<L>;
  }

  export interface PercentageResolver<P extends Numeric = Numeric> {
    percentage(value: Percentage): P;
  }

  export type Resolver<
    L extends Unit.Length = "px",
    P extends Numeric = Numeric
  > = LengthResolver<L> & PercentageResolver<P>;
}
