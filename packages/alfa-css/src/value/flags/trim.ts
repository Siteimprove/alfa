import { Flags } from "@siteimprove/alfa-flags";
import type { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";
import type { Resolvable } from "../resolvable.js";

import { Keyword } from "../textual/keyword.js";
import { Value } from "../value.js";

const { doubleBar, mapResult } = Parser;

const TFlags = Flags.named(
  "trim",
  "discard-before",
  "discard-after",
  "discard-inner",
);
type TFlags = ReturnType<(typeof TFlags)["of"]>;

/**
 * @public
 */
export class TrimFlags
  extends Value<"trim-flags", false>
  implements Resolvable<TrimFlags, never>
{
  public static of(flags: TFlags) {
    return new TrimFlags(flags);
  }

  private readonly _flags: TFlags;

  protected constructor(flags: TFlags) {
    super("trim-flags", false);
    this._flags = flags;
  }

  public get discardBefore(): boolean {
    return this._flags["discard-before"];
  }

  public get discardAfter(): boolean {
    return this._flags["discard-after"];
  }

  public get discardInner(): boolean {
    return this._flags["discard-inner"];
  }

  public resolve(): this {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof TrimFlags && value._flags.equals(this._flags);
  }

  public hash(hash: Hash): void {
    hash.writeNumber(this._flags.value);
  }

  public toJSON(): TrimFlags.JSON {
    const { discardBefore, discardAfter, discardInner } = this;

    return {
      ...super.toJSON(),
      "discard-after": discardAfter,
      "discard-before": discardBefore,
      "discard-inner": discardInner,
    };
  }

  public toString(): string {
    return this._flags.toString();
  }
}

/**
 * @public
 */
export namespace TrimFlags {
  export interface JSON extends Value.JSON<"trim-flags"> {
    "discard-before": boolean;
    "discard-after": boolean;
    "discard-inner": boolean;
  }

  export function isTrimFlags(value: unknown): value is TrimFlags {
    return value instanceof TrimFlags;
  }

  export const parse: CSSParser<TrimFlags> = mapResult(
    doubleBar<
      Slice<Token>,
      [
        Keyword<"discard-before">,
        Keyword<"discard-after">,
        Keyword<"discard-inner">,
      ],
      string
    >(
      Token.parseWhitespace,
      Keyword.parse("discard-before"),
      Keyword.parse("discard-after"),
      Keyword.parse("discard-inner"),
    ),
    (flags) => {
      if (flags.every((flag) => flag === undefined)) {
        return Err.of("Expected at least one trim flag");
      }

      return Result.of(
        TrimFlags.of(TFlags.of(...flags.map((flag) => flag?.value ?? 0))),
      );
    },
  );
}
