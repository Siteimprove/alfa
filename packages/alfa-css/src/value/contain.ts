import type { Hash } from "@siteimprove/alfa-hash";
import { Err, Result } from "@siteimprove/alfa-result";
import { Parser } from "@siteimprove/alfa-parser";

import { Keyword } from "./textual/keyword.js";
import type { Resolvable } from "./resolvable.js";
import { Value } from "./value.js";

import { Token, type Parser as CSSParser } from "../syntax/index.js";
import { Slice } from "@siteimprove/alfa-slice";

const { either } = Parser;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/contain#formal_syntax}
 *
 * @public
 */
export type Contain =
  | Keyword<"none">
  | Keyword<"strict">
  | Keyword<"content">
  | ContainFlags;

/**
 * @public
 */
export class ContainFlags
  extends Value<"contain-flags", false>
  implements Resolvable<ContainFlags, never>
{
  public static of(
    size: boolean,
    inlineSize: boolean,
    layout: boolean,
    style: boolean,
    paint: boolean,
  ) {
    return new ContainFlags(size, inlineSize, layout, style, paint);
  }

  private readonly _size: boolean;
  private readonly _inlineSize: boolean;
  private readonly _layout: boolean;
  private readonly _style: boolean;
  private readonly _paint: boolean;

  private constructor(
    size: boolean,
    inlineSize: boolean,
    layout: boolean,
    style: boolean,
    paint: boolean,
  ) {
    super("contain-flags", false);
    this._size = size;
    this._inlineSize = inlineSize;
    this._layout = layout;
    this._style = style;
    this._paint = paint;
  }

  public get size(): boolean {
    return this._size;
  }

  public get inlineSize(): boolean {
    return this._inlineSize;
  }

  public get layout(): boolean {
    return this._layout;
  }

  public get style(): boolean {
    return this._style;
  }

  public get paint(): boolean {
    return this._paint;
  }

  public resolve(): ContainFlags {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ContainFlags &&
      value._size === this._size &&
      value._inlineSize === this._inlineSize &&
      value._layout === this._layout &&
      value._style === this._style &&
      value._paint === this._paint
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeBoolean(this._size)
      .writeBoolean(this._inlineSize)
      .writeBoolean(this._layout)
      .writeBoolean(this._style)
      .writeBoolean(this._paint);
  }

  public toJSON(): ContainFlags.JSON {
    return {
      ...super.toJSON(),
      size: this._size,
      inlineSize: this._inlineSize,
      layout: this._layout,
      style: this._style,
      paint: this._paint,
    };
  }

  public toString(): string {
    let keywords: Array<string> = [];
    if (this._size) {
      keywords.push("size");
    }
    if (this._inlineSize) {
      keywords.push("inline-size");
    }
    if (this._layout) {
      keywords.push("layout");
    }
    if (this._style) {
      keywords.push("style");
    }
    if (this._paint) {
      keywords.push("paint");
    }

    return keywords.join(" ");
  }
}

/**
 * @public
 */
export namespace ContainFlags {
  export interface JSON extends Value.JSON<"contain-flags"> {
    size: boolean;
    inlineSize: boolean;
    layout: boolean;
    style: boolean;
    paint: boolean;
  }

  export function isContainFlags(value: unknown): value is ContainFlags {
    return value instanceof ContainFlags;
  }

  export const parse: CSSParser<ContainFlags> = (input) => {
    let size: Keyword<"size"> | Keyword<"inline-size"> | undefined;
    let layout: Keyword<"layout"> | undefined;
    let style: Keyword<"style"> | undefined;
    let paint: Keyword<"paint"> | undefined;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (size === undefined) {
        const result = Keyword.parse("size", "inline-size")(input);

        if (result.isOk()) {
          [input, size] = result.get();
          continue;
        }
      }

      if (layout === undefined) {
        const result = Keyword.parse("layout")(input);

        if (result.isOk()) {
          [input, layout] = result.get();
          continue;
        }
      }

      if (style === undefined) {
        const result = Keyword.parse("style")(input);

        if (result.isOk()) {
          [input, style] = result.get();
          continue;
        }
      }

      if (paint === undefined) {
        const result = Keyword.parse("paint")(input);

        if (result.isOk()) {
          [input, paint] = result.get();
          continue;
        }
      }

      break;
    }

    if (
      size === undefined &&
      layout === undefined &&
      style === undefined &&
      paint === undefined
    ) {
      return Err.of("Expected at least one keyword");
    }

    return Result.of([
      input,
      ContainFlags.of(
        size?.value === "size",
        size?.value === "inline-size",
        layout !== undefined,
        style !== undefined,
        paint !== undefined,
      ),
    ]);
  };
}

/**
 * @public
 */
export namespace Contain {
  export const parse: CSSParser<Contain> = either<
    Slice<Token>,
    Contain,
    string
  >(Keyword.parse("none", "strict", "content"), ContainFlags.parse);
}
