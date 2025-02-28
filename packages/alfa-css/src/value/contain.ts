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

class CFlags extends Flags<"contain", CFlags.Flag> {
  public static of(...flags: Array<CFlags.Flag>): CFlags {
    return new CFlags("contain", Flags.reduce(...flags));
  }

  public hasFlag(flag: CFlags.Names): boolean {
    return this.has(CFlags[flag]);
  }

  public toJSON(): CFlags.JSON {
    return {
      ...super.toJSON(),
      size: this.hasFlag("size"),
      inlineSize: this.hasFlag("inlineSize"),
      layout: this.hasFlag("layout"),
      style: this.hasFlag("style"),
      paint: this.hasFlag("paint"),
    };
  }
}

namespace CFlags {
  export interface JSON extends Flags.JSON<"contain"> {
    size: boolean;
    inlineSize: boolean;
    layout: boolean;
    style: boolean;
    paint: boolean;
  }

  export type Flag = 0 | 1 | 2 | 4 | 8 | 16;

  const names = ["size", "inlineSize", "layout", "style", "paint"] as const;
  export type Names = (typeof names)[number];

  export const none = 0 as Flag;
  export const size = (1 << 0) as Flag;
  export const inlineSize = (1 << 1) as Flag;
  export const layout = (1 << 2) as Flag;
  export const style = (1 << 3) as Flag;
  export const paint = (1 << 4) as Flag;
}

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
    return this._flags.hasFlag("size");
  }

  public get inlineSize(): boolean {
    return this._flags.hasFlag("inlineSize");
  }

  public get layout(): boolean {
    return this._flags.hasFlag("layout");
  }

  public get style(): boolean {
    return this._flags.hasFlag("style");
  }

  public get paint(): boolean {
    return this._flags.hasFlag("paint");
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
    let keywords: Array<string> = [];
    if (this.size) {
      keywords.push("size");
    }
    if (this.inlineSize) {
      keywords.push("inline-size");
    }
    if (this.layout) {
      keywords.push("layout");
    }
    if (this.style) {
      keywords.push("style");
    }
    if (this.paint) {
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
    ([size, inlineSize, layout, style, paint]) => {
      if ((size ?? inlineSize ?? layout ?? style ?? paint) === undefined) {
        return Err.of("Expected at least one keyword");
      }

      if (size !== undefined && inlineSize !== undefined) {
        return Err.of("Cannot specify both `size` and `inline-size`");
      }

      return Result.of(
        ContainFlags.of(
          CFlags.of(
            size !== undefined ? CFlags.size : CFlags.none,
            inlineSize !== undefined ? CFlags.inlineSize : CFlags.none,
            layout !== undefined ? CFlags.layout : CFlags.none,
            style !== undefined ? CFlags.style : CFlags.none,
            paint !== undefined ? CFlags.paint : CFlags.none,
          ),
        ),
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
