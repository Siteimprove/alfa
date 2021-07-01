import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

/**
 * @public
 */
export class StyleRule extends Rule {
  public static of(
    selector: string,
    declarations: Iterable<Declaration>,
    hint = false
  ): StyleRule {
    return new StyleRule(selector, Array.from(declarations), hint);
  }

  private readonly _selector: string;
  private readonly _style: Block;
  private readonly _hint: boolean;

  private constructor(
    selector: string,
    declarations: Array<Declaration>,
    hint: boolean
  ) {
    super();

    this._selector = selector;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this))
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
      type: "style",
      selector: this._selector,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `${this._selector} {${style === "" ? "" : `\n${indent(style)}\n`}}`;
  }
}

/**
 * @public
 */
export namespace StyleRule {
  export interface JSON extends Rule.JSON {
    type: "style";
    selector: string;
    style: Block.JSON;
  }

  export function isStyleRule(value: unknown): value is StyleRule {
    return value instanceof StyleRule;
  }

  /**
   * @internal
   */
  export function fromStyleRule(json: JSON): Trampoline<StyleRule> {
    return Trampoline.done(
      StyleRule.of(json.selector, json.style.map(Declaration.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
