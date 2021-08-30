import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

/**
 * @public
 */
export class PageRule extends Rule {
  public static of(
    selector: string,
    declarations: Iterable<Declaration>
  ): PageRule {
    return new PageRule(selector, Array.from(declarations));
  }

  private readonly _selector: string;
  private readonly _style: Block;

  private constructor(selector: string, declarations: Array<Declaration>) {
    super();

    this._selector = selector;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this))
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
      type: "page",
      selector: this._selector,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@page ${this._selector} {${
      style === "" ? "" : `\n${indent(style)}\n`
    }}`;
  }
}

/**
 * @public
 */
export namespace PageRule {
  export interface JSON extends Rule.JSON {
    type: "page";
    selector: string;
    style: Block.JSON;
  }

  export function isPageRule(value: unknown): value is PageRule {
    return value instanceof PageRule;
  }

  /**
   * @internal
   */
  export function fromPageRule(json: JSON): Trampoline<PageRule> {
    return Trampoline.done(
      PageRule.of(json.selector, json.style.map(Declaration.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
