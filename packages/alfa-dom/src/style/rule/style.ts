import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block.js";
import type { Declaration } from "../declaration.js";
import { Rule } from "../rule.js";

/**
 * @public
 */
export class StyleRule extends Rule<"style"> {
  public static of(
    selector: string,
    declarations: Iterable<Declaration>,
    hint = false,
  ): StyleRule {
    return new StyleRule(selector, Array.from(declarations), hint);
  }

  private readonly _selector: string;
  private readonly _style: Block;
  private readonly _hint: boolean;

  private constructor(
    selector: string,
    declarations: Array<Declaration>,
    hint: boolean,
  ) {
    super("style");

    this._selector = selector;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this)),
    );
    this._hint = hint;
  }

  public get selector(): string {
    return this._selector;
  }

  public get style(): Block {
    return this._style;
  }

  public get hint(): boolean {
    return this._hint;
  }

  public toJSON(): StyleRule.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `${this._selector} {${style === "" ? "" : `\n${String.indent(style)}\n`}}`;
  }
}

/**
 * @public
 */
export namespace StyleRule {
  export interface JSON extends Rule.JSON<"style"> {
    selector: string;
    style: Block.JSON | string;
  }

  export function isStyleRule(value: unknown): value is StyleRule {
    return value instanceof StyleRule;
  }

  export function isEmpty(rule: StyleRule): boolean {
    return rule.style.isEmpty();
  }

  /**
   * @internal
   */
  export function fromStyleRule(json: JSON): Trampoline<StyleRule> {
    return Trampoline.done(StyleRule.of(json.selector, Block.from(json.style)));
  }
}
