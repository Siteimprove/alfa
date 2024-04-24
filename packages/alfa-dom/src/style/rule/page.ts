import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

/**
 * @public
 */
export class PageRule extends Rule<"page"> {
  public static of(
    selector: string,
    declarations: Iterable<Declaration>,
  ): PageRule {
    return new PageRule(selector, Array.from(declarations));
  }

  private readonly _selector: string;
  private readonly _style: Block;

  private constructor(selector: string, declarations: Array<Declaration>) {
    super("page");

    this._selector = selector;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this)),
    );
  }

  public get selector(): string {
    return this._selector;
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): PageRule.JSON {
    return {
      ...super.toJSON(),
      selector: this._selector,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@page ${this._selector} {${
      style === "" ? "" : `\n${String.indent(style)}\n`
    }}`;
  }
}

/**
 * @public
 */
export namespace PageRule {
  export interface JSON extends Rule.JSON<"page"> {
    selector: string;
    style: Block.JSON | string;
  }

  export function isPageRule(value: unknown): value is PageRule {
    return value instanceof PageRule;
  }

  /**
   * @internal
   */
  export function fromPageRule(json: JSON): Trampoline<PageRule> {
    return Trampoline.done(PageRule.of(json.selector, Block.from(json.style)));
  }
}
