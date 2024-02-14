import { Lexer } from "@siteimprove/alfa-css";
import { Feature } from "@siteimprove/alfa-css-feature";
import { Iterable } from "@siteimprove/alfa-iterable";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { ConditionRule } from "./condition";

const { map, join } = Iterable;

/**
 * @public
 */
export class MediaRule extends ConditionRule<"media"> {
  public static of(condition: string, rules: Iterable<Rule>): MediaRule {
    return new MediaRule(condition, Array.from(rules));
  }

  private readonly _queries: Feature.Media.List;

  private constructor(condition: string, rules: Array<Rule>) {
    super("media", condition, rules);

    this._queries = Feature.parseMediaQuery(Lexer.lex(condition))
      .map(([, queries]) => queries)
      .getOr(Feature.Media.List.of([]));
  }

  public get queries(): Feature.Media.List {
    return this._queries;
  }

  public toJSON(): MediaRule.JSON {
    return super.toJSON();
  }

  public toString(): string {
    const rules = this._rules
      .map((rule) => String.indent(rule.toString()))
      .join("\n\n");

    return `@media ${this._condition} {${rules === "" ? "" : `\n${rules}\n`}}`;
  }
}

/**
 * @public
 */
export namespace MediaRule {
  export interface JSON extends ConditionRule.JSON<"media"> {}

  export function isMediaRule(value: unknown): value is MediaRule {
    return value instanceof MediaRule;
  }

  /**
   * @internal
   */
  export function fromMediaRule(json: JSON): Trampoline<MediaRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      MediaRule.of(json.condition, rules),
    );
  }
}
