import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import { type Parser as CSSParser, Token } from "../syntax";
import { Unit } from "../unit";

import { Color } from "./color";
import { Keyword } from "./keyword";
import { Length } from "./numeric";
import { Resolvable } from "./resolvable";
import { Value } from "./value";

const { parseIf, separatedList } = Parser;

/**
 * @public
 */
export class Shadow<
    H extends Length = Length,
    V extends Length = H,
    B extends Length = Length,
    S extends Length = Length,
    C extends Color = Color,
  >
  extends Value<"shadow", Value.HasCalculation<[H, V, B, S, C]>>
  implements Resolvable<Shadow.Canonical, Shadow.Resolver>
{
  public static of<
    H extends Length = Length,
    V extends Length = H,
    B extends Length = Length,
    S extends Length = Length,
    C extends Color = Color,
  >(
    horizontal: H,
    vertical: V,
    blur: B,
    spread: S,
    color: C,
    isInset: boolean,
  ): Shadow<H, V, B, S, C> {
    return new Shadow(horizontal, vertical, blur, spread, color, isInset);
  }

  private readonly _horizontal: H;
  private readonly _vertical: V;
  private readonly _blur: B;
  private readonly _spread: S;
  private readonly _color: C;
  private readonly _isInset: boolean;

  private constructor(
    horizontal: H,
    vertical: V,
    blur: B,
    spread: S,
    color: C,
    isInset: boolean,
  ) {
    super(
      "shadow",
      Value.hasCalculation(horizontal, vertical, blur, spread, color),
    );
    this._horizontal = horizontal;
    this._vertical = vertical;
    this._blur = blur;
    this._spread = spread;
    this._color = color;
    this._isInset = isInset;
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public get vertical(): V {
    return this._vertical;
  }

  public get blur(): B {
    return this._blur;
  }

  public get spread(): S {
    return this._spread;
  }

  public get color(): C {
    return this._color;
  }

  public get isInset(): boolean {
    return this._isInset;
  }

  public resolve(resolver: Shadow.Resolver): Shadow.Canonical {
    return new Shadow(
      this._horizontal.resolve(resolver),
      this._vertical.resolve(resolver),
      this._blur.resolve(resolver),
      this._spread.resolve(resolver),
      this._color.resolve(),
      this._isInset,
    );
  }
  public equals(value: unknown): value is this {
    return (
      value instanceof Shadow &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical) &&
      value._blur.equals(this._blur) &&
      value._spread.equals(this._spread) &&
      value._color.equals(this._color) &&
      value._isInset === this._isInset
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeHashable(this._horizontal)
      .writeHashable(this._vertical)
      .writeHashable(this._blur)
      .writeHashable(this._spread)
      .writeHashable(this._color)
      .writeBoolean(this._isInset);
  }

  public toJSON(): Shadow.JSON {
    return {
      ...super.toJSON(),
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
      blur: this._blur.toJSON(),
      spread: this._spread.toJSON(),
      color: this._color.toJSON(),
      isInset: this._isInset,
    };
  }

  public toString(): string {
    return `${this._color} ${this._horizontal} ${this._vertical} ${
      this._blur
    } ${this._spread}${this._isInset ? " inset" : ""}`;
  }
}

/**
 * @public
 */
export namespace Shadow {
  export type Canonical = Shadow<
    Length.Canonical,
    Length.Canonical,
    Length.Canonical,
    Length.Canonical,
    Color.Canonical
  >;
  export interface JSON extends Value.JSON<"shadow"> {
    horizontal: Length.JSON;
    vertical: Length.JSON;
    blur: Length.JSON;
    spread: Length.JSON;
    color: Color.JSON;
    isInset: boolean;
  }

  /**
   * @internal
   */
  export interface Options {
    withInset: boolean;
    withSpread: boolean;
  }

  export type Resolver = Length.Resolver;

  type Sized<T, N extends 3 | 4> = [T, T] | [T, T, T] | N extends 3
    ? never
    : [T, T, T, T];

  function checkLength<T, N extends 3 | 4>(
    max: N,
  ): (array: Array<T>) => array is Sized<T, N> {
    return (array): array is Sized<T, N> =>
      array.length >= 2 && array.length <= max;
  }

  function parseLengths<N extends 3 | 4>(max: N): CSSParser<Sized<Length, N>> {
    return parseIf(
      checkLength<Length, N>(max),
      separatedList(Length.parse, Token.parseWhitespace),
      () => `Shadows must have between 2 and ${max} lengths`,
    );
  }

  export function parse(options?: Options): CSSParser<Shadow> {
    const { withInset = true, withSpread = true } = options ?? {};

    return (input) => {
      let horizontal: Length | undefined;
      let vertical: Length | undefined;
      let blur: Length | undefined;
      let spread: Length | undefined;
      let color: Color | undefined;
      let isInset: boolean | undefined;

      const skipWhitespace = () => {
        for (const [remainder] of Token.parseWhitespace(input)) {
          input = remainder;
        }
      };

      while (true) {
        skipWhitespace();

        if (horizontal === undefined) {
          // horizontal vertical blur? spread?
          const result = parseLengths(withSpread ? 4 : 3)(input);

          if (result.isOk()) {
            [input, [horizontal, vertical, blur, spread]] = result.get();

            continue;
          }
        }

        if (color === undefined) {
          // color: <color>?
          const result = Color.parse(input);

          if (result.isOk()) {
            [input, color] = result.get();
            continue;
          }
        }

        if (isInset === undefined) {
          // isInset: inset?
          const result = Keyword.parse("inset")(input);

          if (result.isOk()) {
            if (!withInset) {
              return Err.of("Inset is not allowed in this shadow");
            }

            isInset = true;
            [input] = result.get();
            continue;
          }
        }

        break;
      }

      if (horizontal === undefined || vertical === undefined) {
        return Err.of("Expected horizontal and vertical offset");
      }

      return Result.of([
        input,
        Shadow.of(
          horizontal,
          vertical,
          blur ?? Length.of(0, Unit.Length.Canonical),
          spread ?? Length.of(0, Unit.Length.Canonical),
          color ?? Keyword.of("currentcolor"),
          isInset ?? false,
        ),
      ]);
    };
  }
}
