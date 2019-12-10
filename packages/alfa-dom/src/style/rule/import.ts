import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Condition } from "./condition";

export class Import extends Condition {
  public static of(
    href: string,
    sheet: Sheet,
    condition: Option<string>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Import {
    return new Import(href, sheet, condition, owner, parent);
  }

  public readonly href: string;
  public readonly sheet: Sheet;

  private constructor(
    href: string,
    sheet: Sheet,
    condition: Option<string>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(condition.getOr("all"), () => [], owner, parent);

    this.href = href;
    this.sheet = sheet;
  }

  public get rules(): Iterable<Rule> {
    return this.sheet.rules;
  }

  public toJSON(): Import.JSON {
    return {
      type: "import",
      rules: [...this.rules].map(rule => rule.toJSON()),
      condition: this.condition,
      href: this.href
    };
  }

  public toString(): string {
    return `@import url(${this.href}) ${this.condition}`;
  }
}

export namespace Import {
  export function isImport(value: unknown): value is Import {
    return value instanceof Import;
  }

  export interface JSON extends Condition.JSON {
    type: "import";
    href: string;
  }

  export function fromImport(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Import {
    return Import.of(
      json.href,
      Sheet.of(owner => {
        return json.rules.map(rule => Rule.fromRule(rule, owner));
      }),
      Option.of(json.condition),
      owner,
      parent
    );
  }
}
