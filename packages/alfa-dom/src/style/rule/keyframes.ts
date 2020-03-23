import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Grouping } from "./grouping";

const { map, join } = Iterable;

export class Keyframes extends Grouping {
  public static of(
    name: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Keyframes {
    return new Keyframes(name, rules, owner, parent);
  }

  private readonly _name: string;

  private constructor(
    name: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(rules, owner, parent);

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
    const rules = join(
      map(this.rules, (rule) => indent(rule.toString())),
      "\n\n"
    );

    return `@keyframes ${this._name} {${rules === "" ? "" : `\n${rules}\n`}}`;
  }
}

export namespace Keyframes {
  export function isKeyframes(value: unknown): value is Keyframes {
    return value instanceof Keyframes;
  }

  export interface JSON extends Grouping.JSON {
    type: "keyframes";
    name: string;
  }

  export function fromKeyframes(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Keyframes {
    return Keyframes.of(
      json.name,
      (self) => {
        const parent = Option.of(self);
        return json.rules.map((rule) => Rule.fromRule(rule, owner, parent));
      },
      owner,
      parent
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
