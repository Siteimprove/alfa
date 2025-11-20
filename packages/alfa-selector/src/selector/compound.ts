import { Array } from "@siteimprove/alfa-array";
import type { Token } from "@siteimprove/alfa-css";
import type { Element } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Context } from "../context.js";
import { Specificity } from "../specificity.js";
import type { Absolute } from "./index.js";

import { Selector } from "./selector.js";
import {
  Class,
  Id,
  PseudoClass,
  PseudoElement,
  Simple,
  Type,
} from "./simple/index.js";

const { map, oneOrMore } = Parser;
const { or, not } = Predicate;

const isPseudo = or(PseudoClass.isPseudoClass, PseudoElement.isPseudoElement);
const hasKey = or(Id.isId, Class.isClass, Type.isType);

/**
 * {@link https://drafts.csswg.org/selectors/#compound}
 *
 * @public
 */
export class Compound extends Selector<"compound"> {
  public static of(...selectors: Array<Simple>): Compound {
    return new Compound(selectors);
  }

  private readonly _selectors: Array<Simple>;
  private readonly _pseudos: Array<Simple>;
  private readonly _nonPseudos: Array<Simple>;
  private readonly _length: number;
  protected readonly _key: Option<Id | Class | Type>;

  protected constructor(selectors: Array<Simple>) {
    super(
      "compound",
      Specificity.sum(...selectors.map((selector) => selector.specificity)),
    );
    this._selectors = selectors;
    this._length = selectors.length;

    // We separate the non-pseudo selectors from the pseudo ones.
    // Per CSS syntax, the non-pseudos must come first, even if we don't enforce
    // this ourselves. So technically, we could avoid traversing the array twice.
    // The non-pseudo are stored in reverse order because they are matched in
    // reverse order.
    this._pseudos = selectors.filter(isPseudo);
    this._nonPseudos = selectors.filter(not(isPseudo)).reverse();

    // We use the last keyed selector as the key for the compound selector
    // under the assumption that they are usually written to be more and more
    // precise, e.g. div.grid.grid--column--3. This notably nearly prevents type
    // to be keys for compound selectors as they must come first. This makes for
    // smaller buckets in the selectors map, hence faster matching.
    this._key = Array.findLast(selectors, hasKey).flatMap(
      (selector) => selector.key,
    );
  }

  public get selectors(): Iterable<Simple> {
    return this._selectors;
  }

  public get length(): number {
    return this._length;
  }

  public matches(element: Element, context?: Context): boolean {
    return (
      // We match the non-pseudo- selectors in reverse order as they are usually
      // written from most generic to most precise, especially in the context of
      // nesting selectors.
      // This is probably not much of a difference for "raw" compound selectors,
      // due to the key selectors selection, but can make a difference when they
      // are part of ancestors selectors.
      // E.g. in `foo.bar`, `.bar` is already the key selector, so in most cases
      // it would anyway only be matched against .foo elements. But in
      // `foo.bar .baz`, the ancestor part doesn't benefits from key selectors
      // so it can be important to match `.bar` before `foo`.
      this._nonPseudos.every((selector) =>
        selector.matches(element, context),
      ) && this._pseudos.every((selector) => selector.matches(element, context))
    );
  }

  public equals(value: Compound): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Compound &&
      Array.equals(value._selectors, this._selectors)
    );
  }

  public *[Symbol.iterator](): Iterator<Compound> {
    yield this;
  }

  public toJSON(): Compound.JSON {
    return {
      ...super.toJSON(),
      selectors: this._selectors.map((selector) => selector.toJSON()),
    };
  }

  public toString(): string {
    return this._selectors.map((selector) => selector.toString()).join("");
  }
}

/**
 * @public
 */
export namespace Compound {
  export interface JSON extends Selector.JSON<"compound"> {
    selectors: Array<Simple.JSON>;
  }

  export function isCompound(value: unknown): value is Compound {
    return value instanceof Compound;
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-compound-selector}
   *
   * @internal
   */
  export const parseCompound = (
    parseSelector: () => Parser<Slice<Token>, Absolute, string>,
  ) =>
    map(oneOrMore(Simple.parse(parseSelector)), (result) =>
      result.length === 1 ? result[0] : Compound.of(...result),
    );
}
