import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import { Option, None } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { ConditionRule } from "./condition";

/**
 * @public
 */
export class ImportRule extends ConditionRule<"import"> {
  public static of(
    href: string,
    sheet: Sheet,
    condition: Option<string> = None,
  ): ImportRule {
    return new ImportRule(href, sheet, condition);
  }

  private readonly _href: string;
  private readonly _sheet: Sheet;
  private readonly _queries: Feature.List;

  private constructor(href: string, sheet: Sheet, condition: Option<string>) {
    super("import", condition.getOr("all"), []);

    this._href = href;
    this._sheet = sheet;
    this._queries = condition
      .flatMap((condition) =>
        Feature.parseMediaQuery(Lexer.lex(condition)).ok(),
      )
      .map(([, queries]) => queries)
      .getOr(Feature.List.of([]));
  }

  public get queries(): Feature.List {
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
      ...super.toJSON(),
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
  export interface JSON extends ConditionRule.JSON<"import"> {
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
      ImportRule.of(json.href, Sheet.of(rules), Option.of(json.condition)),
    );
  }
}
