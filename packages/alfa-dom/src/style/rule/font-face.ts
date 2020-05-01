import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import * as json from "@siteimprove/alfa-json";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";
import { Sheet } from "../sheet";

export class FontFace extends Rule {
  public static of(
    declarations: Mapper<FontFace, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): FontFace {
    return new FontFace(declarations, owner, parent);
  }

  private readonly _style: Block;

  private constructor(
    declarations: Mapper<FontFace, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this._style = Block.of(declarations(this));
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): FontFace.JSON {
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

export namespace FontFace {
  export function isFontFace(value: unknown): value is FontFace {
    return value instanceof FontFace;
  }

  export interface JSON {
    [key: string]: json.JSON;
    type: "font-face";
    style: Block.JSON;
  }

  export function fromFontFace(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): FontFace {
    return FontFace.of(
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
