import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { Condition } from "./condition";

export class Supports extends Condition {
  public static of(condition: string, rules: Iterable<Rule>): Supports {
    return new Supports(condition, Array.from(rules));
  }

  private constructor(condition: string, rules: Array<Rule>) {
    super(condition, rules);
  }

  public toJSON(): Supports.JSON {
    return {
      type: "supports",
      rules: [...this._rules].map((rule) => rule.toJSON()),
      condition: this._condition,
    };
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

export namespace Supports {
  export interface JSON extends Condition.JSON {
    type: "supports";
  }

  export function isSupports(value: unknown): value is Supports {
    return value instanceof Supports;
  }

  /**
   * @internal
   */
  export function fromSupports(json: JSON): Trampoline<Supports> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      Supports.of(json.condition, rules)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
