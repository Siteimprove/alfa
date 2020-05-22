import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";
import { Sheet } from "../sheet";

export class Keyframe extends Rule {
  public static of(
    key: string,
    declarations: Mapper<Keyframe, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Keyframe {
    return new Keyframe(key, declarations, owner, parent);
  }

  private readonly _key: string;
  private readonly _style: Block;

  private constructor(
    key: string,
    declarations: Mapper<Keyframe, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this._key = key;
    this._style = Block.of(declarations(this));
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

  export function fromKeyframe(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Keyframe {
    return Keyframe.of(
      json.key,
      (self) => {
        const parent = Option.of(self);
        return json.style.map((declaration) =>
          Declaration.fromDeclaration(declaration, parent)
        );
      },
      owner,
      parent
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
