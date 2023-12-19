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

  private constructor(condition: string, rules: Array<Rule>) {
    super("supports", condition, rules);
  }

  public toJSON(): SupportsRule.JSON {
    return super.toJSON();
  }

  public toString(): string {
    const rules = this._rules
      .map((rule) => indent(rule.toString()))
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

  export function isSupportsRue(value: unknown): value is SupportsRule {
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

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
