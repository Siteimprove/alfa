import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction } from "../../syntax/index.js";

import { Length } from "../numeric/index.js";
import { Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

import { Function } from "./function.js";

const { map, filter } = Parser;

/**
 * @public
 */
export class Perspective<D extends Length = Length>
  extends Function<"perspective", Value.HasCalculation<[D]>>
  implements Resolvable<Perspective.Canonical, Perspective.Resolver>
{
  public static of<D extends Length>(depth: D): Perspective<D> {
    return new Perspective(depth);
  }

  private readonly _depth: D;

  private constructor(depth: D) {
    super("perspective", Value.hasCalculation(depth));
    this._depth = depth;
  }

  public get depth(): D {
    return this._depth;
  }

  public resolve(resolver: Perspective.Resolver): Perspective.Canonical {
    return new Perspective(this._depth.resolve(resolver));
  }

  public equals(value: unknown): value is this {
    return value instanceof Perspective && value._depth.equals(this._depth);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._depth);
  }

  public toJSON(): Perspective.JSON {
    return {
      ...super.toJSON(),
      depth: this._depth.toJSON(),
    };
  }

  public toString(): string {
    return `perspective(${this._depth})`;
  }
}

/**
 * @public
 */
export namespace Perspective {
  export type Canonical = Perspective<Length.Canonical>;

  export interface JSON extends Function.JSON<"perspective"> {
    depth: Length.JSON;
  }

  export type Resolver = Length.Resolver;

  export function isPerspective<D extends Length.Fixed>(
    value: unknown,
  ): value is Perspective<D> {
    return value instanceof Perspective;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-perspective}
   */
  export const parse = map(
    CSSFunction.parse(
      "perspective",
      filter(
        Length.parse,
        // {@link https://drafts.csswg.org/css-values/#calc-range}
        (length) => length.hasCalculation() || length.value >= 0,
        () => "Depth cannot be less than 0",
      ),
    ),
    ([_, depth]) => Perspective.of(depth),
  );
}
