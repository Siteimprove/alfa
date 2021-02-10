import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";

export class Keyframe extends Rule {
  public static of(key: string, declarations: Iterable<Declaration>): Keyframe {
    return new Keyframe(key, Array.from(declarations));
  }

  private readonly _key: string;
  private readonly _style: Block;

  private constructor(key: string, declarations: Array<Declaration>) {
    super();

    this._key = key;
    this._style = Block.of(
      declarations.filter((declaration) => declaration._attachParent(this))
    );
  }

  public get key(): string {
    return this._key;
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): Keyframe.JSON {
    return {
      type: "keyframe",
      key: this._key,
      style: this._style.toJSON(),
    };
  }

  public toString(): string {
    const style = this._style.toString();

    return `@keyframe ${this._key} {${
      style === "" ? "" : `\n${indent(style)}\n`
    }}`;
  }
}

export namespace Keyframe {
  export interface JSON extends Rule.JSON {
    type: "keyframe";
    key: string;
    style: Block.JSON;
  }

  export function isKeyframe(value: unknown): value is Keyframe {
    return value instanceof Keyframe;
  }

  /**
   * @internal
   */
  export function fromKeyframe(json: JSON): Trampoline<Keyframe> {
    return Trampoline.done(
      Keyframe.of(json.key, json.style.map(Declaration.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
