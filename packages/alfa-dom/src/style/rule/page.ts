import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

export class Page extends Rule {
  public static of(
    selector: string,
    declarations: Iterable<Declaration>
  ): Page {
    return new Page(selector, Array.from(declarations));
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

  public toJSON(): Page.JSON {
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

export namespace Page {
  export interface JSON extends Rule.JSON {
    type: "page";
    selector: string;
    style: Block.JSON;
  }

  export function isPage(value: unknown): value is Page {
    return value instanceof Page;
  }

  /**
   * @internal
   */
  export function fromPage(json: JSON): Trampoline<Page> {
    return Trampoline.done(
      Page.of(json.selector, json.style.map(Declaration.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
