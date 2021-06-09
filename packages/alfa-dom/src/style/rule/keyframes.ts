import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { GroupingRule } from "./grouping";

export class KeyframesRule extends GroupingRule {
  public static of(name: string, rules: Iterable<Rule>): KeyframesRule {
    return new KeyframesRule(name, Array.from(rules));
  }

  private readonly _name: string;

  private constructor(name: string, rules: Array<Rule>) {
    super(rules);

    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public toJSON(): KeyframesRule.JSON {
    return {
      type: "keyframes",
      rules: [...this.rules].map((rule) => rule.toJSON()),
      name: this._name,
    };
  }

  public toString(): string {
    const rules = this._rules
      .map((rule) => indent(rule.toString()))
      .join("\n\n");

    return `@keyframes ${this._name} {${rules === "" ? "" : `\n${rules}\n`}}`;
  }
}

export namespace KeyframesRule {
  export interface JSON extends GroupingRule.JSON {
    type: "keyframes";
    name: string;
  }

  export function isKeyframesRule(value: unknown): value is KeyframesRule {
    return value instanceof KeyframesRule;
  }

  /**
   * @internal
   */
  export function fromKeyframesRule(json: JSON): Trampoline<KeyframesRule> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      KeyframesRule.of(json.name, rules)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
