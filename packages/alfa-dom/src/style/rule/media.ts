import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Condition } from "./condition";
import { Trampoline } from "@siteimprove/alfa-trampoline";

const { map, join } = Iterable;

export class Media extends Condition {
  public static of(condition: string, rules: Iterable<Rule>): Media {
    return new Media(condition, Array.from(rules));
  }

  private constructor(condition: string, rules: Array<Rule>) {
    super(condition, rules);
  }

  public toJSON(): Media.JSON {
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

export namespace Media {
  export interface JSON extends Condition.JSON {
    type: "media";
  }

  export function isMedia(value: unknown): value is Media {
    return value instanceof Media;
  }

  /**
   * @internal
   */
  export function fromMedia(json: JSON): Trampoline<Media> {
    return Trampoline.traverse(json.rules, Rule.fromRule).map((rules) =>
      Media.of(json.condition, rules)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
