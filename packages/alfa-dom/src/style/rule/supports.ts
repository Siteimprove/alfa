import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import type { Option } from "@siteimprove/alfa-option";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { ConditionRule } from "./condition";

/**
 * @public
 */
export class SupportsRule extends ConditionRule<"supports"> {
  public static of(condition: string, rules: Iterable<Rule>): SupportsRule {
    return new SupportsRule(condition, Array.from(rules));
  }

  private readonly _query: Option<Feature.Supports.Query>;

  private constructor(condition: string, rules: Array<Rule>) {
    super("supports", condition, rules);

    this._query = Feature.parseSupportsQuery(Lexer.lex(condition))
      .map(([, query]) => query)
      .ok();
  }

  public get query(): Option<Feature.Supports.Query> {
    return this._query;
  }

  public toJSON(): SupportsRule.JSON {
    return super.toJSON();
  }

  public toString(): string {
    const rules = this._rules
      .map((rule) => String.indent(rule.toString()))
      .join("\n\n");

    return `@supports ${this._condition} {${
      rules === "" ? "" : `\n${rules}\n`
    }}`;
  }
}

/**
 * @public
 */
export namespace SupportsRule {
  export interface JSON extends ConditionRule.JSON<"supports"> {}

  export function isSupportsRule(value: unknown): value is SupportsRule {
    return value instanceof SupportsRule;
  }

  /**
   * @internal
   */
  export function fromSupportsRule(json: JSON): Trampoline<SupportsRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      SupportsRule.of(json.condition, rules),
    );
  }
}
