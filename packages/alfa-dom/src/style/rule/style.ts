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

  public readonly selector: string;
  public readonly style: Block;

  private constructor(
    selector: string,
    declarations: Mapper<Style, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this.selector = selector;
    this.style = Block.of(declarations(this));
  }

  public toJSON(): Style.JSON {
    return {
      type: "style",
      selector: this.selector,
      style: this.style.toJSON()
    };
  }

  public toString(): string {
    const style = this.style.toString();

    return `${this.selector} {${style === "" ? "" : `\n${indent(style)}\n`}}`;
  }
}

export namespace Style {
  export function isStyle(value: unknown): value is Style {
    return value instanceof Style;
  }

  export interface JSON {
    type: "style";
    selector: string;
    style: Block.JSON;
  }

  export function fromStyle(
    style: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Style {
    return Style.of(
      style.selector,
      self => {
        const parent = Option.of(self);
        return style.style.map(declaration =>
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
