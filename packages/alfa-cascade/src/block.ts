import { Array } from "@siteimprove/alfa-array";
import { type Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Lexer } from "@siteimprove/alfa-css";
import { Declaration, h, Rule, StyleRule } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
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
export class Block<
    S extends Compound | Complex | Simple = Compound | Complex | Simple,
  >
  implements Equatable, Serializable<Block.JSON<S>>
{
  /**
   * Create a block.
   *
   * @remarks
   * This does not validate coupling of the data. Prefer using Block.from()
   */
  public static of<
    S extends Compound | Complex | Simple = Compound | Complex | Simple,
  >(
    rule: StyleRule,
    selector: S,
    declarations: Iterable<Declaration>,
    precedence: Precedence,
  ): Block<S> {
    return new Block(rule, selector, Array.from(declarations), precedence);
  }

  private static _empty = new Block(
    h.rule.style("*", []),
    Universal.of(None),
    [],
    {
      origin: Origin.NormalUserAgent,
      importance: false,
      specificity: Specificity.empty(),
      order: Infinity,
    },
  );
  /**
   * @internal
   */
  public static empty(): Block {
    return this._empty;
  }

  private readonly _rule: StyleRule;
  private readonly _selector: S;
  private readonly _declarations: Array<Declaration>;
  private readonly _precedence: Precedence;

  constructor(
    rule: StyleRule,
    selector: S,
    declarations: Array<Declaration>,
    precedence: Precedence,
  ) {
    this._rule = rule;
    this._selector = selector;
    this._declarations = declarations;
    this._precedence = precedence;
  }

  public get rule(): StyleRule {
    return this._rule;
  }

  public get selector(): S {
    return this._selector;
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
      this._rule.equals(value._rule) &&
      this._selector.equals(value._selector) &&
      Array.equals(value._declarations, this._declarations) &&
      Precedence.compare(value._precedence, this._precedence) ===
        Comparison.Equal
    );
  }

  public toJSON(): Block.JSON<S> {
    return {
      rule: this._rule.toJSON(),
      selector: Serializable.toJSON(this._selector),
      declarations: Array.toJSON(this._declarations),
      precedence: Precedence.toJSON(this._precedence),
    };
  }
}
/**
 * @internal
 */
export namespace Block {
  export interface JSON<
    S extends Compound | Complex | Simple = Compound | Complex | Simple,
  > {
    [key: string]: json.JSON;
    rule: Rule.JSON;
    selector: Serializable.ToJSON<S>;
    declarations: Array<Declaration.JSON>;
    precedence: Precedence.JSON;
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
  export function from(rule: StyleRule, order: number): [Array<Block>, number] {
    let blocks: Array<Block> = [];

    for (const [_, selectors] of Selector.parse(Lexer.lex(rule.selector))) {
      // The selector was parsed succsefully, so blocks will be created and we need to update order.
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
            Block.of(rule, selector, declarations, {
              origin,
              importance,
              order,
              specificity: selector.specificity,
            }),
          );
        }
      }
    }
    return [blocks, order];
  }

  export const compare: Comparer<Block> = (a, b) =>
    Precedence.compare(a.precedence, b.precedence);
}
