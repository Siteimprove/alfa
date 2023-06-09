import { Hash } from "@siteimprove/alfa-hash";

import { Length } from "./numeric";

import { Value } from "../value";
import { Color } from "./color";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "../syntax";
import { Keyword } from "./keyword";
import { Err, Result } from "@siteimprove/alfa-result";

/**
 * @public
 */
export class Shadow<
  H extends Length.Fixed = Length.Fixed,
  V extends Length.Fixed = H,
  B extends Length.Fixed = Length.Fixed,
  S extends Length.Fixed = Length.Fixed,
  C extends Color = Color
> extends Value<"shadow", false> {
  public static of<
    H extends Length.Fixed = Length.Fixed,
    V extends Length.Fixed = H,
    B extends Length.Fixed = Length.Fixed,
    S extends Length.Fixed = Length.Fixed,
    C extends Color = Color
  >(
    horizontal: H,
    vertical: V,
    blur: B,
    spread: S,
    color: C,
    isInset: boolean
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
    isInset: boolean
  ) {
    super("shadow", false);
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

  public resolve(): Shadow<H, V, B, S, C> {
    return this;
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
  export interface JSON extends Value.JSON<"shadow"> {
    horizontal: Length.Fixed.JSON;
    vertical: Length.Fixed.JSON;
    blur: Length.Fixed.JSON;
    spread: Length.Fixed.JSON;
    color: Color.JSON;
    isInset: boolean;
  }

  export const parse: Parser<Slice<Token>, Shadow, string> = (input) => {
    let horizontal: Length.Fixed | undefined;
    let vertical: Length.Fixed | undefined;
    let blur: Length.Fixed | undefined;
    let spread: Length.Fixed | undefined;
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
        // horizontal: <length>
        const result = Length.parseBase(input);

        if (result.isOk()) {
          [input, horizontal] = result.get();
          skipWhitespace();

          {
            // vertical: <length>
            const result = Length.parseBase(input);

            if (result.isErr()) {
              return result;
            }

            // the previous check ensure that the result is Ok
            [input, vertical] = result.getUnsafe();
            skipWhitespace();

            {
              // blur: <length>?
              const result = Length.parseBase(input);

              if (result.isOk()) {
                [input, blur] = result.get();
                skipWhitespace();

                {
                  // spread: <length>?
                  const result = Length.parseBase(input);

                  if (result.isOk()) {
                    [input, spread] = result.get();
                  }
                }
              }
            }
          }

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
        blur ?? Length.of(0, "px"),
        spread ?? Length.of(0, "px"),
        color ?? Keyword.of("currentcolor"),
        isInset ?? false
      ),
    ]);
  };
}
