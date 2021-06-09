import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

export class FontFaceRule extends Rule {
  public static of(declarations: Iterable<Declaration>): FontFaceRule {
    return new FontFaceRule(Array.from(declarations));
  }

  private readonly _style: Block;

  private constructor(declarations: Array<Declaration>) {
    super();

    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this))
    );
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): FontFaceRule.JSON {
    return {
      type: "font-face",
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@font-face {${style === "" ? "" : `\n${indent(style)}\n`}}`;
  }
}

export namespace FontFaceRule {
  export interface JSON {
    [key: string]: json.JSON;
    type: "font-face";
    style: Block.JSON;
  }

  export function isFontFaceRule(value: unknown): value is FontFaceRule {
    return value instanceof FontFaceRule;
  }

  /**
   * @internal
   */
  export function fromFontFaceRule(json: JSON): Trampoline<FontFaceRule> {
    return Trampoline.done(FontFaceRule.of(json.style.map(Declaration.from)));
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
