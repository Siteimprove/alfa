import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Rule } from "../rule";
import { Grouping } from "./grouping";

export class Keyframes extends Grouping {
  public static of(name: string, rules: Iterable<Rule>): Keyframes {
    return new Keyframes(name, Array.from(rules));
  }

  private readonly _name: string;

  private constructor(name: string, rules: Array<Rule>) {
    super(rules);

    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public toJSON(): Keyframes.JSON {
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

export namespace Keyframes {
  export interface JSON extends Grouping.JSON {
    type: "keyframes";
    name: string;
  }

  export function isKeyframes(value: unknown): value is Keyframes {
    return value instanceof Keyframes;
  }

  /**
   * @internal
   */
  export function fromKeyframes(json: JSON): Trampoline<Keyframes> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      Keyframes.of(json.name, rules)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
