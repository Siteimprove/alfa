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

  private readonly _href: string;
  private readonly _sheet: Sheet;

  private constructor(
    href: string,
    sheet: Sheet,
    condition: Option<string>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(condition.getOr("all"), () => [], owner, parent);

    this._href = href;
    this._sheet = sheet;
  }

  public get rules(): Iterable<Rule> {
    return this._sheet.rules;
  }

  public get href(): string {
    return this._href;
  }

  public get sheet(): Sheet {
    return this._sheet;
  }

  public toJSON(): Import.JSON {
    return {
      type: "import",
      rules: [...this._sheet.rules].map((rule) => rule.toJSON()),
      condition: this._condition,
      href: this._href,
    };
  }

  public toString(): string {
    return `@import url(${this._href}) ${this._condition}`;
  }
}

export namespace Import {
  export interface JSON extends Condition.JSON {
    type: "import";
    href: string;
  }

  export function isImport(value: unknown): value is Import {
    return value instanceof Import;
  }

  export function fromImport(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Import {
    return Import.of(
      json.href,
      Sheet.of((owner) => {
        return json.rules.map((rule) => Rule.fromRule(rule, owner));
      }),
      Option.of(json.condition),
      owner,
      parent
    );
  }
}
