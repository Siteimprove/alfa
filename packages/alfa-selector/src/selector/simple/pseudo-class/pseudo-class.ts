import {
  Function,
  Nth,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute } from "../../../selector";

import { WithName } from "../../selector";

const { end, left, map, right } = Parser;
const { parseColon } = Token;

/**
 * @internal
 */
export abstract class PseudoClassSelector<
  N extends string = string,
> extends WithName<"pseudo-class", N> {
  protected constructor(name: N) {
    super("pseudo-class", name);
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

/**
 * @internal
 */
export namespace PseudoClassSelector {
  export interface JSON<N extends string = string>
    extends WithName.JSON<"pseudo-class", N> {}

  /**
   * Parses a non-functional pseudo-class (`:<name>`)
   */
  export function parseNonFunctional<T extends PseudoClassSelector>(
    name: string,
    of: () => T,
  ): CSSParser<T> {
    return map(right(parseColon, Token.parseIdent(name)), of);
  }
}

/**
 * @internal
 */
export abstract class WithIndex<
  N extends string = string,
> extends PseudoClassSelector<N> {
  protected static readonly _indices = new WeakMap<Element, number>();

  protected readonly _index: Nth;

  protected constructor(name: N, nth: Nth) {
    super(name);

    this._index = nth;
  }

  public equals(value: WithIndex): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof WithIndex && value._index.equals(this._index);
  }

  public toJSON(): WithIndex.JSON<N> {
    return {
      ...super.toJSON(),
      index: this._index.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index})`;
  }
}

/**
 * @internal
 */
export namespace WithIndex {
  export interface JSON<N extends string = string>
    extends PseudoClassSelector.JSON<N> {
    index: Nth.JSON;
  }

  const parseNth = left(
    Nth.parse,
    end((token) => `Unexpected token ${token}`),
  );

  /**
   * Parses a functional pseudo-class accepting a nth argument (an+b)
   */
  export function parseWithIndex<T extends WithIndex>(
    name: string,
    of: (nth: Nth) => T,
  ): CSSParser<T> {
    return map(right(parseColon, Function.parse(name, parseNth)), ([, nth]) =>
      of(nth),
    );
  }
}

/**
 * @internal
 */
export abstract class WithSelector<
  N extends string = string,
> extends PseudoClassSelector<N> {
  protected readonly _selector: Absolute;

  protected constructor(name: N, selector: Absolute) {
    super(name);
    this._selector = selector;
  }

  public get selector(): Absolute {
    return this._selector;
  }

  public equals(value: WithSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithSelector && value._selector.equals(this._selector)
    );
  }

  public toJSON(): WithSelector.JSON<N> {
    return {
      ...super.toJSON(),
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._selector})`;
  }
}

/**
 * @internal
 */
export namespace WithSelector {
  export interface JSON<N extends string = string>
    extends PseudoClassSelector.JSON<N> {
    selector: Absolute.JSON;
  }

  /**
   * Parses a functional pseudo-class accepting a selector argument
   */
  export function parseWithSelector<T extends WithSelector>(
    name: string,
    parseSelector: Thunk<CSSParser<Absolute>>,
    of: (selector: Absolute) => T,
  ): CSSParser<T> {
    return map(
      right(parseColon, Function.parse(name, parseSelector)),
      ([, selector]) => of(selector),
    );
  }
}
