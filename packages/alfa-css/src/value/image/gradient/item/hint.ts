import { Hash } from "@siteimprove/alfa-hash";

import { Parser } from "@siteimprove/alfa-parser";

import type { Parser as CSSParser } from "../../../../syntax/index.js";

import { LengthPercentage } from "../../../numeric/index.js";
import type { PartiallyResolvable, Resolvable } from "../../../resolvable.js";
import { Value } from "../../../value.js";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#color-transition-hint}
 */
export class Hint<P extends LengthPercentage = LengthPercentage>
  extends Value<"hint", Value.HasCalculation<[P]>>
  implements
    Resolvable<Hint.Canonical, Hint.Resolver>,
    PartiallyResolvable<Hint.PartiallyResolved, Hint.PartialResolver>
{
  public static of<P extends LengthPercentage>(position: P): Hint<P> {
    return new Hint(position);
  }

  private readonly _position: P;

  private constructor(position: P) {
    super("hint", Value.hasCalculation(position));
    this._position = position;
  }

  public get position(): P {
    return this._position;
  }

  public resolve(resolver: Hint.Resolver): Hint.Canonical {
    return new Hint(LengthPercentage.resolve(resolver)(this._position));
  }

  public partiallyResolve(
    resolver: Hint.PartialResolver,
  ): Hint.PartiallyResolved {
    return new Hint(
      LengthPercentage.partiallyResolve(resolver)(this._position),
    );
  }

  public equals(value: unknown): value is this {
    return value instanceof Hint && value._position.equals(this._position);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._position);
  }

  public toJSON(): Hint.JSON {
    return {
      type: "hint",
      position: this._position.toJSON(),
    };
  }

  public toString(): string {
    return `${this._position}`;
  }
}

export namespace Hint {
  export type Canonical = Hint<LengthPercentage.Canonical>;

  export type PartiallyResolved = Hint<LengthPercentage.PartiallyResolved>;

  export interface JSON extends Value.JSON<"hint"> {
    position: LengthPercentage.JSON;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = LengthPercentage.PartialResolver;

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-hint}
   */
  export const parse: CSSParser<Hint> = map(LengthPercentage.parse, Hint.of);
}
