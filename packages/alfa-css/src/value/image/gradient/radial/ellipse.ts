import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import { Parser as CSSParser, Token } from "../../../../syntax";

import { Keyword } from "../../../keyword";
import { LengthPercentage } from "../../../numeric";
import { PartiallyResolvable, Resolvable } from "../../../resolvable";
import { Value } from "../../../value";

const { option, separatedList } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-ellipse}
 *
 * @internal
 */
export class Ellipse<R extends LengthPercentage = LengthPercentage>
  extends Value<"ellipse", Value.HasCalculation<[R, R]>>
  implements
    Resolvable<Ellipse.Canonical, Ellipse.Resolver>,
    PartiallyResolvable<Ellipse.PartiallyResolved, Ellipse.PartialResolver>
{
  public static of<R extends LengthPercentage>(
    horizontal: R,
    vertical: R,
  ): Ellipse<R> {
    return new Ellipse(horizontal, vertical);
  }

  private readonly _horizontal: R;
  private readonly _vertical: R;

  private constructor(horizontal: R, vertical: R) {
    super("ellipse", Value.hasCalculation(horizontal, vertical));
    this._horizontal = horizontal;
    this._vertical = vertical;
  }

  public get horizontal(): R {
    return this._horizontal;
  }

  public get vertical(): R {
    return this._vertical;
  }

  public resolve(resolver: Ellipse.Resolver): Ellipse.Canonical {
    return new Ellipse(
      LengthPercentage.resolve(resolver)(this._horizontal),
      LengthPercentage.resolve(resolver)(this._vertical),
    );
  }

  public partiallyResolve(
    resolver: Ellipse.PartialResolver,
  ): Ellipse.PartiallyResolved {
    return new Ellipse(
      LengthPercentage.partiallyResolve(resolver)(this._horizontal),
      LengthPercentage.partiallyResolve(resolver)(this._vertical),
    );
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
  export type Canonical = Ellipse<LengthPercentage.Canonical>;

  export type PartiallyResolved = Ellipse<LengthPercentage.PartiallyResolved>;

  export interface JSON extends Value.JSON<"ellipse"> {
    horizontal: LengthPercentage.JSON;
    vertical: LengthPercentage.JSON;
  }

  export type Resolver = LengthPercentage.Resolver;

  export type PartialResolver = LengthPercentage.PartialResolver;

  export function isEllipse(value: unknown): value is Ellipse {
    return value instanceof Ellipse;
  }

  const parseShape = Keyword.parse("ellipse");

  const parseSize = separatedList(
    LengthPercentage.parse,
    option(Token.parseWhitespace),
    2,
    2,
  );

  export const parse: CSSParser<Ellipse> = (input) => {
    let shape: Keyword<"ellipse"> | undefined;
    let horizontal: LengthPercentage | undefined;
    let vertical: LengthPercentage | undefined;

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
