import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";
import { Sheet } from "../sheet";

export class Style extends Rule {
  public static of(
    selector: string,
    declarations: Mapper<Style, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Style {
    return new Style(selector, declarations, owner, parent);
  }

  private readonly _selector: string;
  private readonly _style: Block;

  private constructor(
    selector: string,
    declarations: Mapper<Style, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this._selector = selector;
    this._style = Block.of(declarations(this));
  }

  public get selector(): string {
    return this._selector;
  }

  public get style(): Block {
    return this._style;
  }

  public toJSON(): Style.JSON {
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

export namespace Style {
  export interface JSON extends Rule.JSON {
    type: "style";
    selector: string;
    style: Block.JSON;
  }

  export function isStyle(value: unknown): value is Style {
    return value instanceof Style;
  }

  export function fromStyle(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Style {
    return Style.of(
      json.selector,
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
