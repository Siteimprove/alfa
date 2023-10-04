import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import { Parser as CSSParser } from "../../../syntax";

import { Length, Percentage } from "../../numeric";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#color-transition-hint}
 */
export class Hint<
  P extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed
> implements Equatable, Hashable, Serializable
{
  public static of<P extends Length.Fixed | Percentage.Fixed>(
    position: P
  ): Hint<P> {
    return new Hint(position);
  }

  private readonly _position: P;

  private constructor(position: P) {
    this._position = position;
  }

  public get type(): "hint" {
    return "hint";
  }

  public get position(): P {
    return this._position;
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
  export type Canonical = Hint<Percentage.Canonical | Length.Canonical>;

  export interface JSON {
    [key: string]: json.JSON;
    type: "hint";
    position: Length.Fixed.JSON | Percentage.Fixed.JSON;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-linear-color-hint}
   */
  export const parse: CSSParser<Hint> = map(
    either(Length.parseBase, Percentage.parseBase),
    (position) => Hint.of(position)
  );
}
