import {
  Function,
  Nth,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Context } from "../../../context";
import type { Absolute } from "../../../selector";

import { WithName } from "../../selector";

const { end, left, map, right } = Parser;
const { parseColon } = Token;

export abstract class PseudoClassSelector<
  N extends string = string,
> extends WithName<"pseudo-class", N> {
  protected constructor(name: N) {
    super("pseudo-class", name);
  }

  public matches(element: Element, context?: Context): boolean {
    return false;
  }

  public equals(value: PseudoClassSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof PseudoClassSelector && super.equals(value);
  }

  public toJSON(): PseudoClassSelector.JSON<N> {
    return {
      ...super.toJSON(),
    };
  }

  public toString(): string {
    return `:${this._name}`;
  }
}

export namespace PseudoClassSelector {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-class", N> {}

  /**
   * Parses a non-functional pseudo-class (`:<name>`)
   *
   * @internal
   */
  export function parseNonFunctional<T extends PseudoClassSelector>(
    name: string,
    of: () => T,
  ): CSSParser<T> {
    return map(right(parseColon, Token.parseIdent(name)), of);
  }

  /**
   * Parses a functional pseudo-class accepting a selector argument
   *
   * @internal
   */
  export function parseFunctionalWithSelector<T extends PseudoClassSelector>(
    name: string,
    parseSelector: Thunk<CSSParser<Absolute>>,
    of: (selector: Absolute) => T,
  ): CSSParser<T> {
    return map(
      right(parseColon, Function.parse(name, parseSelector)),
      ([, selector]) => of(selector),
    );
  }

  const parseNth = left(
    Nth.parse,
    end((token) => `Unexpected token ${token}`),
  );

  /**
   * Parses a functional pseudo-class accepting a nth argument (an+b)
   *
   * @internal
   */
  export function parseFunctionalWithNth<T extends PseudoClassSelector>(
    name: string,
    of: (nth: Nth) => T,
  ): CSSParser<T> {
    return map(right(parseColon, Function.parse(name, parseNth)), ([, nth]) =>
      of(nth),
    );
  }
}
