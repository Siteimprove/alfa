import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block.ts";
import type { Declaration } from "../declaration.ts";
import { BaseRule } from "./rule.ts";

/**
 * @public
 */
export class FontFaceRule extends BaseRule<"font-face"> {
  public static of(declarations: Iterable<Declaration>): FontFaceRule {
    return new FontFaceRule(Array.from(declarations));
  }

  private readonly _style: Block;

  protected constructor(declarations: Array<Declaration>) {
    super("font-face");

    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this)),
    );
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): FontFaceRule.JSON {
    return {
      ...super.toJSON(),
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@font-face {${style === "" ? "" : `\n${String.indent(style)}\n`}}`;
  }
}

/**
 * @public
 */
export namespace FontFaceRule {
  export interface JSON extends BaseRule.JSON<"font-face"> {
    style: Block.JSON | string;
  }

  export function isFontFaceRule(value: unknown): value is FontFaceRule {
    return value instanceof FontFaceRule;
  }

  /**
   * @internal
   */
  export function fromFontFaceRule(json: JSON): Trampoline<FontFaceRule> {
    return Trampoline.done(FontFaceRule.of(Block.from(json.style)));
  }
}
