import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";
import { Specificity } from "../../../specificity.js";

import { WithName } from "../../selector.js";

const { map, right, take, takeBetween } = Parser;
const { parseColon, parseIdent } = Token;

export abstract class PseudoElementSelector<
  N extends string = string,
> extends WithName<"pseudo-element", N> {
  protected constructor(
    name: N,
    specificity: Specificity = Specificity.of(0, 0, 1),
    useContext: boolean = false,
  ) {
    super("pseudo-element", name, specificity, useContext);
  }

  public equals(value: PseudoElementSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoElementSelector && super.equals(value);
  }

  public toJSON(): PseudoElementSelector.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `::${this._name}`;
  }
}

export namespace PseudoElementSelector {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-element", N> {}

  /**
   * Parses a non-functional, non-legacy pseudo-element (`::<name>`)
   */
  export function parseNonLegacy<T extends PseudoElementSelector>(
    name: string,
    of: Thunk<T>,
  ): CSSParser<T> {
    return map(right(take(parseColon, 2), parseIdent(name)), of);
  }

  /**
   * Parses a non-functional, legacy pseudo-element (`::<name>` or `:<name>`)
   */
  export function parseLegacy<T extends PseudoElementSelector>(
    name: string,
    of: Thunk<T>,
  ): CSSParser<T> {
    return map(
      right(takeBetween(Token.parseColon, 1, 2), Token.parseIdent(name)),
      of,
    );
  }
}
