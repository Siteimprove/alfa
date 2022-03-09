import { Option, None } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";
import { Media } from "@siteimprove/alfa-media";
import { Lexer } from "@siteimprove/alfa-css";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { ConditionRule } from "./condition";

/**
 * @public
 */
export class ImportRule extends ConditionRule {
  public static of(
    href: string,
    sheet: Sheet,
    condition: Option<string> = None
  ): ImportRule {
    return new ImportRule(href, sheet, condition);
  }

  private readonly _href: string;
  private readonly _sheet: Sheet;
  private readonly _queries: Media.List;

  private constructor(href: string, sheet: Sheet, condition: Option<string>) {
    super(condition.getOr("all"), []);

    this._href = href;
    this._sheet = sheet;
    this._queries = condition
      .flatMap((condition) => Media.parse(Lexer.lex(condition)).ok())
      .map(([, queries]) => queries)
      .getOr(Media.List.of([]));
  }

  public get queries(): Media.List {
    return this._queries;
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

  public toJSON(): ImportRule.JSON {
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

/**
 * @public
 */
export namespace ImportRule {
  export interface JSON extends ConditionRule.JSON {
    type: "import";
    href: string;
  }

  export function isImportRule(value: unknown): value is ImportRule {
    return value instanceof ImportRule;
  }

  /**
   * @internal
   */
  export function fromImportRule(json: JSON): Trampoline<ImportRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      ImportRule.of(json.href, Sheet.of(rules), Option.of(json.condition))
    );
  }
}
