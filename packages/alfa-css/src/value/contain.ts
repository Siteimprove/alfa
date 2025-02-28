import { Flags } from "@siteimprove/alfa-flags";
import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { type Parser as CSSParser, Token } from "../syntax/index.js";
import type { Resolvable } from "./resolvable.js";

import { Keyword } from "./textual/keyword.js";
import { Value } from "./value.js";

const { doubleBar, either, mapResult } = Parser;

/**
 * {@link
 * https://developer.mozilla.org/en-US/docs/Web/CSS/contain#formal_syntax}
 *
 * @public
 */
export type Contain =
  | Keyword<"none">
  | Keyword<"strict">
  | Keyword<"content">
  | ContainFlags;

const CFlags = Flags.named(
  "contain",
  "size",
  "inline-size",
  "layout",
  "style",
  "paint",
);
type CFlags = ReturnType<(typeof CFlags)["of"]>;

/**
 * @public
 */
export class ContainFlags
  extends Value<"contain-flags", false>
  implements Resolvable<ContainFlags, never>
{
  public static of(flags: CFlags) {
    return new ContainFlags(flags);
  }

  private readonly _flags: CFlags;

  protected constructor(flags: CFlags) {
    super("contain-flags", false);
    this._flags = flags;
  }

  public get size(): boolean {
    return this._flags.size;
  }

  public get inlineSize(): boolean {
    return this._flags["inline-size"];
  }

  public get layout(): boolean {
    return this._flags.layout;
  }

  public get style(): boolean {
    return this._flags.style;
  }

  public get paint(): boolean {
    return this._flags.paint;
  }

  public resolve(): ContainFlags {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof ContainFlags && value._flags.equals(this._flags);
  }

  public hash(hash: Hash): void {
    hash.writeNumber(this._flags.value);
  }

  public toJSON(): ContainFlags.JSON {
    const { size, inlineSize, layout, style, paint } = this;

    return { ...super.toJSON(), size, inlineSize, layout, style, paint };
  }

  public toString(): string {
    return this._flags.toString();
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

  export const parse: CSSParser<ContainFlags> = mapResult(
    doubleBar<
      Slice<Token>,
      [
        Keyword<"size">,
        Keyword<"inline-size">,
        Keyword<"layout">,
        Keyword<"style">,
        Keyword<"paint">,
      ],
      string
    >(
      Token.parseWhitespace,
      Keyword.parse("size"),
      Keyword.parse("inline-size"),
      Keyword.parse("layout"),
      Keyword.parse("style"),
      Keyword.parse("paint"),
    ),
    (flags) => {
      if (flags.every((flag) => flag === undefined)) {
        return Err.of("Expected at least one contain flag");
      }

      if (flags[0] !== undefined && flags[1] !== undefined) {
        return Err.of("Cannot specify both `size` and `inline-size`");
      }

      return Result.of(
        ContainFlags.of(CFlags.of(...flags.map((flag) => flag?.value ?? 0))),
      );
    },
  );
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
