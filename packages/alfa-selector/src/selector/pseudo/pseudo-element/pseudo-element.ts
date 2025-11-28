import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";
import { Parser } from "@siteimprove/alfa-parser";

const { map, right, take, takeBetween } = Parser;

import { Specificity } from "../../../specificity.js";

import { WithName } from "../../selector.js";

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
  export function parseNonLegacy<T>(
    name: string,
    constructors: Record<string, Thunk<T>> | Thunk<T>,
  ): CSSParser<T> {
    return (input: Slice<Token>) => {
      const constructor =
        typeof constructors === "function" ? constructors : constructors[name];
      if (constructor === undefined) {
        return Err.of(`Unknown pseudo-element: ${name}`);
      }
      // We need to eta-expand in order to discard the result of parseIdent.
      return map(right(take(Token.parseColon, 2), Token.parseIdent(name)), () =>
        constructor(),
      )(input);
    };
  }

  /**
   * Parses a non-functional, legacy pseudo-element (`::<name>` or `:<name>`)
   */
  export function parseLegacy<T>(
    name: string,
    constructors: Record<string, Thunk<T>> | Thunk<T>,
  ): CSSParser<T> {
    return (input: Slice<Token>) => {
      const constructor =
        typeof constructors === "function" ? constructors : constructors[name];
      if (constructor === undefined) {
        return Err.of(`Unknown legacy pseudo-element: ${name}`);
      }
      // We need to eta-expand in order to discard the result of parseIdent.
      return map(
        right(takeBetween(Token.parseColon, 1, 2), Token.parseIdent(name)),
        () => constructor(),
      )(input);
    };
  }

  /**
   * Parses a functional pseudo-element (`::<name>(...)`)
   */
  export function parseFunctional<T>(
    name: string,
    parsers: Record<string, CSSParser<T>>,
  ): CSSParser<T> {
    const parser = parsers[name];
    if (parser === undefined) {
      return () => Err.of(`Unknown pseudo-element function: ${name}`);
    }
    return parser;
  }
}
