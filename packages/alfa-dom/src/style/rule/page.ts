import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Block } from "../block";
import { Declaration } from "../declaration";
import { Rule } from "../rule";
import { Sheet } from "../sheet";

export class Page extends Rule {
  public static of(
    selector: string,
    declarations: Mapper<Page, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Page {
    return new Page(selector, declarations, owner, parent);
  }

  public readonly selector: string;
  public readonly style: Block;

  private constructor(
    selector: string,
    declarations: Mapper<Page, Iterable<Declaration>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this.selector = selector;
    this.style = Block.of(declarations(this));
  }

  public toJSON(): Page.JSON {
    return {
      type: "page",
      selector: this.selector,
      style: this.style.toJSON()
    };
  }

  public toString(): string {
    const style = this.style.toString();

    return `@page ${this.selector} {${
      style === "" ? "" : `\n${indent(style)}\n`
    }}`;
  }
}

export namespace Page {
  export function isPage(value: unknown): value is Page {
    return value instanceof Page;
  }

  export interface JSON extends Rule.JSON {
    type: "page";
    selector: string;
    style: Block.JSON;
  }

  export function fromPage(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Page {
    return Page.of(
      json.selector,
      self => {
        const parent = Option.of(self);
        return json.style.map(declaration =>
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
