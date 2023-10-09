import { Hash } from "@siteimprove/alfa-hash";

import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser } from "../../../../syntax";

import { LengthPercentage } from "../../../numeric";
import { Value } from "../../../value";

const { map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#color-transition-hint}
 */
export class Hint<P extends LengthPercentage = LengthPercentage> extends Value<
  "hint",
  Value.HasCalculation<[P]>
> {
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

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Hint) => PartiallyResolved {
    return (value) =>
      Hint.of(LengthPercentage.partiallyResolve(resolver)(value.position));
  }

  export function isHint(value: unknown): value is Hint {
    return value instanceof Hint;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-hint}
   */
  export const parse: CSSParser<Hint> = map(LengthPercentage.parse, Hint.of);
}
