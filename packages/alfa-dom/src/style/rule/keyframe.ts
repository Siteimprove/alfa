import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block.js";
import type { Declaration } from "../declaration.js";
import { Rule } from "../rule.js";

/**
 * @public
 */
export class KeyframeRule extends Rule<"keyframe"> {
  public static of(
    key: string,
    declarations: Iterable<Declaration>,
  ): KeyframeRule {
    return new KeyframeRule(key, Array.from(declarations));
  }

  private readonly _key: string;
  private readonly _style: Block;

  protected constructor(key: string, declarations: Array<Declaration>) {
    super("keyframe");

    this._key = key;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this)),
    );
  }

  public get key(): string {
    return this._key;
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): KeyframeRule.JSON {
    return {
      ...super.toJSON(),
      key: this._key,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@keyframe ${this._key} {${
      style === "" ? "" : `\n${String.indent(style)}\n`
    }}`;
  }
}

/**
 * @public
 */
export namespace KeyframeRule {
  export interface JSON extends Rule.JSON<"keyframe"> {
    key: string;
    style: Block.JSON | string;
  }

  export function isKeyframeRule(value: unknown): value is KeyframeRule {
    return value instanceof KeyframeRule;
  }

  /**
   * @internal
   */
  export function fromKeyframeRule(json: JSON): Trampoline<KeyframeRule> {
    return Trampoline.done(
      KeyframeRule.of(json.key, Block.from(json.style).declarations),
    );
  }
}
