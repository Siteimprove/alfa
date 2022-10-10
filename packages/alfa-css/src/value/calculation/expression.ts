import { Equatable } from "@siteimprove/alfa-equatable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import { Unit } from "../unit/unit";
import { Length, Number, Numeric, Percentage } from "../numeric";

import { Kind } from "./kind";

/**
 * {@link https://drafts.csswg.org/css-values/#calculation-tree}
 *
 * @public
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
  >(resolver: Expression.Resolver<L, P>): Expression;

  public toLength(): Option<Length> {
    return None;
  }

  public toNumber(): Option<Number> {
    return None;
  }

  public toPercentage(): Option<Percentage> {
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

/**
 * @public
 */
export namespace Expression {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
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
