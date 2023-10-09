import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import { Parser as CSSParser, Token } from "../../../../syntax";

import { Keyword } from "../../../keyword";
import { Length, Percentage } from "../../../numeric";

const { either, option, delimited, take } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-ellipse}
 *
 * @internal
 */
export class Ellipse<
  R extends Length.Fixed | Percentage.Fixed = Length.Fixed | Percentage.Fixed
> implements Equatable, Hashable, Serializable<Ellipse.JSON>
{
  public static of<R extends Length.Fixed | Percentage.Fixed>(
    horizontal: R,
    vertical: R
  ): Ellipse<R> {
    return new Ellipse(horizontal, vertical);
  }

  private readonly _horizontal: R;
  private readonly _vertical: R;

  private constructor(horizontal: R, vertical: R) {
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get type(): "ellipse" {
    return "ellipse";
  }

  public get horizontal(): R {
    return this._horizontal;
  }

  public get vertical(): R {
    return this._vertical;
  }

  public equals(value: Ellipse): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Ellipse &&
      value._horizontal.equals(this._horizontal) &&
      value._vertical.equals(this._vertical)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._horizontal).writeHashable(this._vertical);
  }

  public toJSON(): Ellipse.JSON {
    return {
      type: "ellipse",
      horizontal: this._horizontal.toJSON(),
      vertical: this._vertical.toJSON(),
    };
  }

  public toString(): string {
    return `ellipse ${this._horizontal} ${this._vertical}`;
  }
}

/**
 * @internal
 */
export namespace Ellipse {
  export type Canonical = Ellipse<Percentage.Canonical | Length.Canonical>;

  export interface JSON {
    [key: string]: json.JSON;
    type: "ellipse";
    horizontal: Length.Fixed.JSON | Percentage.Fixed.JSON;
    vertical: Length.Fixed.JSON | Percentage.Fixed.JSON;
  }

  const parseShape = Keyword.parse("ellipse");

  const parseSize = take(
    delimited(
      option(Token.parseWhitespace),
      either(Length.parseBase, Percentage.parseBase)
    ),
    2
  );

  export const parse: CSSParser<Ellipse> = (input) => {
    let shape: Keyword<"ellipse"> | undefined;
    let horizontal: Length.Fixed | Percentage.Fixed | undefined;
    let vertical: Length.Fixed | Percentage.Fixed | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (shape === undefined) {
        const result = parseShape(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (horizontal === undefined || vertical === undefined) {
        const result = parseSize(input);

        if (result.isOk()) {
          [input, [horizontal, vertical]] = result.get();
          continue;
        }
      }

      break;
    }

    if (horizontal === undefined || vertical === undefined) {
      return Err.of(`Expected ellipse size`);
    }

    return Result.of([input, Ellipse.of(horizontal, vertical)]);
  };
}
