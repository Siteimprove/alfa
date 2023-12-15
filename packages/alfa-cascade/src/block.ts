import { Array } from "@siteimprove/alfa-array";
import { type Comparer, Comparison } from "@siteimprove/alfa-comparable";
import { Declaration, Rule, StyleRule } from "@siteimprove/alfa-dom";
import type { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Selector } from "@siteimprove/alfa-selector";

import * as json from "@siteimprove/alfa-json";

import { Precedence } from "./precedence";

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
export class Block implements Equatable, Serializable<Block.JSON> {
  /**
   * Create a block.
   *
   * @remarks
   * This does not validate coupling of the data. Prefer using Block.from()
   */
  public static of(
    rule: StyleRule,
    selector: Selector,
    declarations: Iterable<Declaration>,
    precedence: Precedence,
  ): Block {
    return new Block(rule, selector, Array.from(declarations), precedence);
  }

  private readonly _rule: StyleRule;
  private readonly _selector: Selector;
  private readonly _declarations: Array<Declaration>;
  private readonly _precedence: Precedence;

  constructor(
    rule: StyleRule,
    selector: Selector,
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

  public get selector(): Selector {
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

  public toJSON(): Block.JSON {
    return {
      rule: this._rule.toJSON(),
      selector: this._selector.toJSON(),
      declarations: Array.toJSON(this._declarations),
      precedence: Precedence.toJSON(this._precedence),
    };
  }
}
/**
 * @internal
 */
export namespace Block {
  export interface JSON {
    [key: string]: json.JSON;
    rule: Rule.JSON;
    selector: Selector.JSON;
    declarations: Array<Declaration.JSON>;
    precedence: Precedence.JSON;
  }

  export const compare: Comparer<Block> = (a, b) =>
    Precedence.compare(a.precedence, b.precedence);
}
