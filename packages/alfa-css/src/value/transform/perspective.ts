import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
} from "../../syntax";

import { Length } from "../numeric";
import { Value } from "../value";

import { Function } from "./function";

const { map, filter } = Parser;

/**
 * @public
 */
export class Perspective<
  D extends Length = Length,
  CALC extends boolean = boolean
> extends Function<"perspective", CALC> {
  public static of<D extends Length>(
    depth: D
  ): Perspective<D, Value.HasCalculation<[D]>> {
    return new Perspective(depth, Value.hasCalculation(depth));
  }

  private readonly _depth: D;

  private constructor(depth: D, hasCalculation: CALC) {
    super("perspective", hasCalculation);
    this._depth = depth;
  }

  public get depth(): D {
    return this._depth;
  }

  public resolve(resolver: Perspective.Resolver): Perspective.Canonical {
    return new Perspective(this._depth.resolve(resolver), false);
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
  export type Canonical = Perspective<Length.Canonical, false>;

  export interface JSON extends Function.JSON<"perspective"> {
    depth: Length.JSON;
  }

  export type Resolver = Length.Resolver;

  export function isPerspective<D extends Length.Fixed>(
    value: unknown
  ): value is Perspective<D> {
    return value instanceof Perspective;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-perspective}
   */
  export const parse: CSSParser<Perspective> = map(
    CSSFunction.parse(
      "perspective",
      filter(
        Length.parse,
        // {@link https://drafts.csswg.org/css-values/#calc-range}
        (length) => Length.isCalculated(length) || length.value >= 0,
        () => "Depth cannot be less than 0"
      )
    ),
    ([_, depth]) => Perspective.of(depth)
  );
}
