import { Cache } from "@siteimprove/alfa-cache";
import { Function, Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Context } from "../../../context.js";
import { Specificity } from "../../../specificity.js";

import type { Compound, Selector, Simple } from "../../index.js";
import { BaseSelector } from "../../selector.js";

import { PseudoClassSelector } from "./pseudo-class.js";

const { either, filter, map, right } = Parser;
const { parseColon } = Token;

/**
 * {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 *
 * @privateRemarks
 * Since WithSelector has a mandatory selector, it is not convenient
 * to use it to group both the functional and non-functional variants.
 *
 * In CSS lingo, `:host` only accepts a compound selector, but simple
 * selectors are also compounds. Alfa does make a type difference between
 * a Simple selector and a compound selector with only a single Simple
 * selector. Hence, this also accepts Simple selector. This also accepts
 * pseudo-elements, which seems to not be really allowed by the specification.
 *
 * @public
 */
export class Host extends PseudoClassSelector<"host"> {
  public static of(selector?: Compound | Simple): Host {
    return new Host(Option.from(selector));
  }

  private readonly _selector: Option<Compound | Simple>;

  protected constructor(selector: Option<Compound | Simple>) {
    super(
      "host",
      Specificity.sum(
        selector
          .map((selector) => selector.specificity)
          .getOr(Specificity.empty()),
        Specificity.of(0, 1, 0),
      ),
    );

    this._selector = selector;
  }

  public get selector(): Option<Compound | Simple> {
    return this._selector;
  }

  /**
   * @remarks
   * `:host` never matches anything in its own tree.
   */
  public matches(): boolean {
    return false;
  }

  @Cache.memoize
  private _matchHost(element: Element, context: Context): boolean {
    return this._selector.every((selector) =>
      selector.matches(element, context),
    );
  }

  /**
   * Checks whether a shadow host matches.
   *
   * @remarks
   * This must be called with `element` being the shadow host of
   * the Document that defines the selector.
   */
  public matchHost(
    element: Element,
    context: Context = Context.empty(),
  ): boolean {
    return this._matchHost(element, context);
  }

  public *[Symbol.iterator](): Iterator<Host> {
    yield this;
  }

  public equals(value: Host): boolean;

  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return value instanceof Host && value._selector.equals(this._selector);
  }

  public toJSON(): Host.JSON {
    return {
      ...super.toJSON(),
      ...(this._selector.isSome()
        ? { selector: this._selector.get().toJSON() }
        : {}),
    };
  }
}

/**
 * @public
 */
export namespace Host {
  export interface JSON extends PseudoClassSelector.JSON<"host"> {
    selector?: Compound.JSON | Simple.JSON;
  }

  export function isHost(value: unknown): value is Host {
    return value instanceof Host;
  }

  export const parse = (parseSelector: Selector.Parser.Component) =>
    either(
      // We need to try the functional variant first to avoid the non-functional
      // greedily passing.
      map(
        right(
          parseColon,
          Function.parse("host", () =>
            filter(
              parseSelector(),
              BaseSelector.hasCompoundType,
              () => ":host() only accepts compound selectors",
            ),
          ),
        ),
        ([, selector]) => Host.of(selector),
      ),
      PseudoClassSelector.parseNonFunctional("host", Host.of),
    );
}
