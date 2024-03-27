import { Array } from "@siteimprove/alfa-array";
import { Function, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { PseudoElementSelector } from "./pseudo-element";

const { map, separatedList } = Parser;

/**
 * {@link https://drafts.csswg.org/css-shadow-parts-1/#part}
 */
export class Part extends PseudoElementSelector<"part"> {
  public static of(idents: Iterable<Token.Ident>): Part {
    return new Part(Array.from(idents));
  }

  private readonly _idents: ReadonlyArray<Token.Ident>;

  private constructor(idents: Array<Token.Ident>) {
    super("part");
    this._idents = idents;
  }

  /** @public (knip) */
  public get idents(): Iterable<Token.Ident> {
    return this._idents;
  }

  public *[Symbol.iterator](): Iterator<Part> {
    yield this;
  }

  public equals(value: Part): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Part && Array.equals(value._idents, this._idents);
  }

  public toJSON(): Part.JSON {
    return {
      ...super.toJSON(),
      idents: Array.toJSON(this._idents),
    };
  }

  public toString(): string {
    return `::${this.name}(${this._idents})`;
  }
}

export namespace Part {
  export interface JSON extends PseudoElementSelector.JSON<"part"> {
    idents: Array<Token.Ident.JSON>;
  }

  export const parse = map(
    Function.parse(
      "part",
      separatedList(Token.parseIdent(), Token.parseWhitespace),
    ),
    ([_, idents]) => Part.of(idents),
  );
}
