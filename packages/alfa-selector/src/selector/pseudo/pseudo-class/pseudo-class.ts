import {
  Function,
  Nth,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import type { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute, Selector } from "../../index.js";
import { Specificity } from "../../../specificity.js";

import { WithName } from "../../selector.js";

const { delimited, end, left, map, option, pair, right } = Parser;
const { parseColon, parseIdent, parseWhitespace } = Token;

/**
 * @internal
 */
export abstract class PseudoClassSelector<
  N extends string = string,
> extends WithName<"pseudo-class", N> {
  // Some pseudo-class manipulate specificity, so we cannot just set it
  // to (0, 1, 0) for all and must allow for overwriting it.
  // https://www.w3.org/TR/selectors/#specificity
  protected constructor(
    name: N,
    useContext: boolean,
    specificity: Specificity = Specificity.pseudoClass(),
  ) {
    super("pseudo-class", name, specificity, useContext);
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
    of: Thunk<T>,
  ): CSSParser<T> {
    return map(
      right(parseColon, parseIdent(name)),
      // We explicitly need to discard the parsed identifier and not pass it
      // to a function that may use it (but was super-typed as a Thunk).
      () => of(),
    );
  }
}

/**
 * @internal
 */
export abstract class WithIndex<
  N extends string = string,
> extends PseudoClassSelector<N> {
  // For pseudo-classes that do not filter the set of elements, we can use a static
  // map of sibling positions.
  // For pseudo-classes that may filter the set of elements, we need this to be
  // an instance map since two instances may have different extra selector and
  // set of candidates.
  protected static readonly _indices = new WeakMap<Element, number>();

  protected readonly _index: Nth;

  protected constructor(
    name: N,
    nth: Nth,
    useContext: boolean,
    specificity?: Specificity,
  ) {
    super(name, useContext, specificity);

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

const parseNth = left(
  Nth.parse,
  end((token) => `Unexpected token ${token}`),
);

/**
 * @internal
 */
export namespace WithIndex {
  export interface JSON<N extends string = string>
    extends PseudoClassSelector.JSON<N> {
    index: Nth.JSON;
  }

  /**
   * Parses a functional pseudo-class accepting a nth argument (an+b)
   *
   * @privateRemarks
   * This can't be named just "parse" as it is overwritten by subclasses with a
   * different type of parameter (namely, the selector parser).
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
  S extends Selector = Absolute,
> extends PseudoClassSelector<N> {
  protected readonly _selector: S;

  protected constructor(
    name: N,
    selector: S,
    specificity: Specificity,
    useContext: boolean,
  ) {
    super(name, useContext, specificity);
    this._selector = selector;
  }

  public get selector(): S {
    return this._selector;
  }

  public equals(value: WithSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithSelector && value._selector.equals(this._selector)
    );
  }

  public toJSON(): WithSelector.JSON<N, S> {
    return {
      ...super.toJSON(),
      selector: Serializable.toJSON(this._selector),
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
  export interface JSON<
    N extends string = string,
    S extends Selector = Absolute,
  > extends PseudoClassSelector.JSON<N> {
    selector: Serializable.ToJSON<S>;
  }

  /**
   * Parses a functional pseudo-class accepting a selector argument
   *
   * @privateRemarks
   * This can't be named just "parse" as it is overwritten by subclasses with a
   * different type of parameter (namely, no "name" or "of").
   */
  export function parseWithSelector<
    S extends Selector,
    N extends string,
    T extends WithSelector<N, S>,
  >(
    name: string,
    parseSelector: Thunk<CSSParser<S>>,
    of: (selector: S) => T,
  ): CSSParser<T> {
    return map(
      right(parseColon, Function.parse(name, parseSelector)),
      ([, selector]) => of(selector),
    );
  }
}

/**
 * @internal
 */
export abstract class WithIndexAndSelector<
  N extends string = string,
> extends WithIndex<N> {
  protected readonly _selector: Option<Absolute>;

  protected constructor(
    name: N,
    nth: Nth,
    selector: Option<Absolute>,
    useContext: boolean,
    // Both :nth-child and :nth-last-child have this specificity
    specificity: Specificity = Specificity.sum(
      Specificity.of(0, 1, 0),
      selector.map((s) => s.specificity).getOr(Specificity.of(0, 0, 0)),
    ),
  ) {
    super(name, nth, useContext, specificity);

    this._selector = selector;
  }

  public get selector(): Option<Absolute> {
    return this._selector;
  }

  public equals(value: WithIndexAndSelector): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithIndexAndSelector &&
      super.equals(value) &&
      value._selector.equals(this._selector)
    );
  }

  public toJSON(): WithIndexAndSelector.JSON<N> {
    return {
      ...super.toJSON(),
      ...(this._selector.isSome()
        ? { selector: this._selector.get().toJSON() }
        : {}),
    };
  }

  public toString(): string {
    return `:${this.name}(${this._index} of ${this._selector})`;
  }
}

/**
 * @internal
 */
export namespace WithIndexAndSelector {
  export interface JSON<N extends string = string> extends WithIndex.JSON<N> {
    selector?: Absolute.JSON;
  }

  /**
   * Parses a functional pseudo-class accepting a nth argument (an+b)
   *
   * @privateRemarks
   * This can't be named just "parse" as it is overwritten by subclasses with a
   * different type of parameter (namely, no "name" or "of").
   */
  export function parseWithIndexAndSelector<T extends WithIndex>(
    name: string,
    parseSelector: Selector.Parser.Component,
    of: (nth: Nth, selector: Option<Absolute>) => T,
  ): CSSParser<T> {
    return map(
      right(
        parseColon,
        Function.parse(name, () =>
          pair(
            Nth.parse,
            option(
              right(
                delimited(parseWhitespace, parseIdent("of")),
                parseSelector(),
              ),
            ),
          ),
        ),
      ),
      ([, [nth, selector]]) => of(nth, selector),
    );
  }
}
