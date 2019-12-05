import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Condition } from "./condition";
import { Grouping } from "./grouping";

const { map, join } = Iterable;

export class Supports extends Condition {
  public static of(
    condition: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Supports {
    return new Supports(condition, rules, owner, parent);
  }

  private constructor(
    condition: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(condition, rules, owner, parent);
  }

  public toJSON(): Supports.JSON {
    return {
      type: "supports",
      rules: [...this.rules].map(rule => rule.toJSON()),
      condition: this.condition
    };
  }

  public toString(): string {
    const rules = join(
      map(this.rules, rule => indent(rule.toString())),
      "\n\n"
    );

    return `@supports ${this.condition} {${
      rules === "" ? "" : `\n${rules}\n`
    }}`;
  }
}

export namespace Supports {
  export function isSupports(value: unknown): value is Supports {
    return value instanceof Supports;
  }

  export interface JSON extends Condition.JSON {
    type: "supports";
  }

  export function fromSupports(
    json: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Supports {
    return Supports.of(
      json.condition,
      self => {
        const parent = Option.of(self);
        return json.rules.map(rule => Rule.fromRule(rule, owner, parent));
      },
      owner,
      parent
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
