import { Element } from "@siteimprove/alfa-dom";
import { Maybe, None, type Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import type { Context } from "../context.js";

import { Specificity } from "../specificity.js";

import type { Selector } from "./index.js";
import { Combinator } from "./combinator.js";
import { Complex } from "./complex.js";
import type { Compound } from "./compound.js";
import { BaseSelector } from "./selector.js";
import type { Simple } from "./simple/index.js";

const { either, map, pair } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#relative-selector}
 *
 * @public
 */
export class Relative extends BaseSelector<"relative"> {
  public static of(
    combinator: Combinator,
    selector: Simple | Compound | Complex,
  ): Relative {
    return new Relative(combinator, selector);
  }

  private readonly _combinator: Combinator;
  private readonly _selector: Simple | Compound | Complex;
  private readonly _anchor: Option<Exact>;

  protected constructor(
    combinator: Combinator,
    selector: Simple | Compound | Complex,
    anchor: Maybe<Exact> = None,
  ) {
    super("relative", selector.specificity);
    this._combinator = combinator;
    this._selector = selector;
    this._anchor = Maybe.toOption(anchor);
  }

  public get combinator(): Combinator {
    return this._combinator;
  }

  public get selector(): Simple | Compound | Complex {
    return this._selector;
  }

  public get anchor(): Option<Exact> {
    return this._anchor;
  }

  public matches(element: Element, context?: Context): boolean {
    return this._anchor.some((anchor) =>
      Combinator.matcher(
        anchor,
        this._combinator,
        this._selector,
        element,
        context,
      ),
    );
  }

  public anchoredAt(anchor: Element): Relative {
    return new Relative(this._combinator, this._selector, Exact.of(anchor));
  }

  public equals(value: Relative): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Relative &&
      value._combinator === this._combinator &&
      value._selector.equals(this._selector)
    );
  }

  public *[Symbol.iterator](): Iterator<Relative> {
    yield this;
  }

  public toJSON(): Relative.JSON {
    return {
      ...super.toJSON(),
      combinator: this._combinator,
      selector: this._selector.toJSON(),
    };
  }

  public toString(): string {
    const combinator =
      this._combinator === Combinator.Descendant ? "" : `${this._combinator} `;

    return `${combinator}${this._selector}`;
  }
}

/**
 * @public
 */
export namespace Relative {
  export interface JSON extends BaseSelector.JSON<"relative"> {
    combinator: string;
    selector: Simple.JSON | Compound.JSON | Complex.JSON;
  }

  export function isRelative(value: unknown): value is Relative {
    return value instanceof Relative;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-relative-selector}
   */
  export const parse = (parseSelector: Selector.Parser.Component) =>
    map(
      either(
        pair(Combinator.parse, Complex.parse(parseSelector)),
        // Absolute selectors can also be parsed as relative with an implied
        // descendant combinator, e.g. in `:has(h1)`. In this case the
        // whitespace that usually represents the descendant combinator in
        // complex selectors is omitted. We cannot handle that in Combinator.parse
        // as it would turn it into a "catch all" parser.
        map(
          Complex.parse(parseSelector),
          (selector) => [Combinator.Descendant, selector] as const,
        ),
      ),
      (result) => {
        const [combinator, selector] = result;

        return Relative.of(combinator, selector);
      },
    );
}

/**
 * Fake selector to match the anchor of relative selector, thus allowing to
 * match an anchored relative selector as a complex one.
 */
class Exact extends BaseSelector<"exact"> {
  public static of(anchor: Element): Exact {
    return new Exact(anchor);
  }

  private readonly _anchor: Element;

  protected constructor(anchor: Element) {
    super("exact", Specificity.empty());
    this._anchor = anchor;
  }

  public matches(element: Element, _: any): boolean {
    return element === this._anchor;
  }

  public *[Symbol.iterator](): Iterator<never> {
    return;
  }
}
