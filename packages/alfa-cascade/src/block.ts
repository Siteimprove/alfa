import { Array } from "@siteimprove/alfa-array";
import { type Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Lexer } from "@siteimprove/alfa-css";
import {
  type Block as StyleBlock,
  Declaration,
  Element,
  h,
  Rule,
  StyleRule,
} from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None } from "@siteimprove/alfa-option";
import {
  type Complex,
  type Compound,
  Selector,
  type Simple,
  Specificity,
  Universal,
} from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

import { Origin, Precedence } from "./precedence";
import { UserAgent } from "./user-agent";

/**
 * While resolving cascade, a Block is a style rule that has been expanded with
 * its selector pre-parsed, its declarations extracted, and extra information
 * about Cascade Sorting Precedence.
 *
 * @remarks
 * Blocks imply coupling between the different parts and are thus grouped into
 * a single structure.
 *
 * Blocks form the data stored in the rule tree and selector map. Upon building the
 * cascade, style rules are turned into Blocks which are inserted into the selector
 * map; and then relevant Blocks are inserted into the rule tree upon matching elements.
 *
 * @internal
 */
export class Block<S extends Element | Block.Source = Element | Block.Source>
  implements Equatable, Serializable<Block.JSON<S>>
{
  /**
   * Create a block.
   *
   * @remarks
   * This does not validate coupling of the data. Prefer using Block.from()
   */
  public static of<S extends Element | Block.Source = Element | Block.Source>(
    source: S,
    declarations: Iterable<Declaration>,
    precedence: Precedence,
  ): Block<S> {
    return new Block(source, Array.from(declarations), precedence);
  }

  private static _empty = new Block(
    {
      rule: h.rule.style("*", []),
      selector: Universal.of(None),
    },
    [],
    {
      origin: Origin.NormalUserAgent,
      isElementAttached: false,
      specificity: Specificity.empty(),
      order: -Infinity,
    },
  );
  /**
   * @internal
   */
  public static empty(): Block {
    return this._empty;
  }

  // These could be Options instead.
  // However, these (especially the selector) are used on hot path when
  // resolving cascade. Having them nullable, and encoding the nullability
  // in the type, allow for direct access without the small overhead of Options.
  private readonly _rule: S extends Block.Source ? StyleRule : null;
  private readonly _selector: S extends Block.Source
    ? Compound | Complex | Simple
    : null;
  private readonly _owner: S extends Element ? Element : null;
  private readonly _declarations: Array<Declaration>;
  private readonly _precedence: Precedence;

  constructor(
    source: S,
    declarations: Array<Declaration>,
    precedence: Precedence,
  ) {
    if (Element.isElement(source)) {
      this._rule = null as S extends Block.Source ? StyleRule : null;
      this._selector = null as S extends Block.Source
        ? Compound | Complex | Simple
        : null;
      this._owner = source as unknown as S extends Element ? Element : null;
    } else {
      this._rule = source.rule as S extends Block.Source ? StyleRule : null;
      this._selector = source.selector as S extends Block.Source
        ? Compound | Complex | Simple
        : null;
      this._owner = null as S extends Element ? Element : null;
    }
    this._declarations = declarations;
    this._precedence = precedence;
  }

  public get source(): S {
    return this._owner !== null
      ? (this._owner as unknown as S)
      : // By construction if owner is unset, then rule and selector are set.
        ({ rule: this._rule, selector: this._selector } as S);
  }

  public get rule(): S extends Block.Source ? StyleRule : null {
    return this._rule;
  }

  public get selector(): S extends Block.Source
    ? Compound | Complex | Simple
    : null {
    return this._selector;
  }

  public get owner(): S extends Element ? Element : null {
    return this._owner;
  }

  public get declarations(): Iterable<Declaration> {
    return this._declarations;
  }

  public get precedence(): Readonly<Precedence> {
    return this._precedence;
  }

  public equals(value: Block): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Block &&
      Equatable.equals(value._rule, this._rule) &&
      Equatable.equals(value._selector, this._selector) &&
      Equatable.equals(value._owner, this._owner) &&
      Array.equals(value._declarations, this._declarations) &&
      Precedence.compare(value._precedence, this._precedence) ===
        Comparison.Equal
    );
  }

  public toJSON(): Block.JSON<S> {
    return {
      source: (Element.isElement(this._owner)
        ? this._owner.toJSON()
        : {
            rule: this._rule!.toJSON(),
            selector: Serializable.toJSON(this._selector),
          }) as S extends Element
        ? Element.JSON
        : {
            rule: Rule.JSON;
            selector: Serializable.ToJSON<S>;
          },
      declarations: Array.toJSON(this._declarations),
      precedence: Precedence.toJSON(this._precedence),
    };
  }
}
/**
 * @internal
 */
export namespace Block {
  export interface JSON<S extends Element | Source = Element | Source> {
    [key: string]: json.JSON;
    source: S extends Element
      ? Element.JSON
      : {
          rule: Rule.JSON;
          selector: Serializable.ToJSON<S>;
        };
    declarations: Array<Declaration.JSON>;
    precedence: Precedence.JSON;
  }

  /**
   * @internal
   */
  export interface Source {
    rule: StyleRule;
    selector: Compound | Complex | Simple;
  }

  /**
   * Build Blocks from a style rule. Returns the last order used, that is unchanged
   * if selector couldn't be parsed, increased by 1 otherwise.
   *
   * @remarks
   * Order is relative to the list of all style rules and thus cannot be inferred
   * from the rule itself.
   *
   * A single rule creates more than one block.
   * * Declarations inside the rule are split by importance.
   * * Rules with a list selector are split into their components.
   *   E.g., a `div, span { color: red }` rule will create one block
   *   for `div { color: red }`, and a similar one for `span`.
   * Since all these blocks are declared at the same time, and are either declaring
   * the exact same declarations, or non-conflicting ones (due to importance), they can
   * share the exact same order.
   */
  export function from(
    rule: StyleRule,
    order: number,
  ): [Array<Block<Source>>, number] {
    let blocks: Array<Block<Source>> = [];

    for (const [_, selectors] of Selector.parse(Lexer.lex(rule.selector))) {
      // The selector was parsed successfully, so blocks will be created, and we need to update order.
      order++;

      for (const [importance, declarations] of Iterable.groupBy(
        rule.style.declarations,
        (declaration) => declaration.important,
      )) {
        const origin = rule.owner.includes(UserAgent)
          ? importance
            ? Origin.ImportantUserAgent
            : Origin.NormalUserAgent
          : importance
            ? Origin.ImportantAuthor
            : Origin.NormalAuthor;

        for (const selector of selectors) {
          blocks.push(
            Block.of({ rule, selector }, declarations, {
              origin,
              isElementAttached: false,
              order,
              specificity: selector.specificity,
            }),
          );
        }
      }
    }
    return [blocks, order];
  }

  /**
   * Turns the style attribute of an element into blocks (one for important
   * declaration, one for normal declarations).
   * @param element
   */
  export function fromStyle(element: Element): Iterable<Block> {
    return element.style
      .map((style) =>
        Iterable.map(
          Iterable.groupBy(
            style.declarations,
            (declaration) => declaration.important,
          ),
          ([importance, declarations]) =>
            Block.of(element, declarations, {
              origin: importance ? Origin.ImportantAuthor : Origin.NormalAuthor,
              isElementAttached: true,
              specificity: Specificity.empty(),
              // Since style attribute trumps style rules in the cascade sort,
              // and there is at most one style attribute per element,
              // the order never matters.
              order: -1,
            }),
        ),
      )
      .getOr<Iterable<Block>>([]);
  }

  export const compare: Comparer<Block> = (a, b) =>
    Precedence.compare(a.precedence, b.precedence);
}
