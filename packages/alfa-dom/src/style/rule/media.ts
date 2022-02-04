// import { Lexer } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
// import { Media } from "@siteimprove/alfa-media";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { ConditionRule } from "./condition";

const { map, join } = Iterable;

/**
 * @public
 */
export class MediaRule extends ConditionRule {
  public static of(condition: string, rules: Iterable<Rule>): MediaRule {
    return new MediaRule(condition, Array.from(rules));
  }

  // private readonly _queries: Media.List;

  private constructor(condition: string, rules: Array<Rule>) {
    super(condition, rules);

    // this._queries = Media.parse(Lexer.lex(condition))
    //   .map(([, queries]) => queries)
    //   .getOr(Media.List.of([]));
  }

  // public get queries(): Media.List {
  //   return this._queries;
  // }

  public toJSON(): MediaRule.JSON {
    return {
      type: "media",
      rules: [...this._rules].map((rule) => rule.toJSON()),
      condition: this._condition,
    };
  }

  public toString(): string {
    const rules = join(
      map(this._rules, (rule) => indent(rule.toString())),
      "\n\n"
    );

    return `@media ${this._condition} {${rules === "" ? "" : `\n${rules}\n`}}`;
  }
}

/**
 * @public
 */
export namespace MediaRule {
  export interface JSON extends ConditionRule.JSON {
    type: "media";
  }

  export function isMediaRule(value: unknown): value is MediaRule {
    return value instanceof MediaRule;
  }

  /**
   * @internal
   */
  export function fromMediaRule(json: JSON): Trampoline<MediaRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      MediaRule.of(json.condition, rules)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
