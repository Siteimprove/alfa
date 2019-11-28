import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Condition } from "./condition";
import { Grouping } from "./grouping";

const { map, join } = Iterable;

export class Media extends Condition {
  public static of(
    condition: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Media {
    return new Media(condition, rules, owner, parent);
  }

  private constructor(
    condition: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(condition, rules, owner, parent);
  }

  public toJSON(): Media.JSON {
    return {
      type: "media",
      rules: [...this.rules].map(rule => rule.toJSON()),
      condition: this.condition
    };
  }

  public toString(): string {
    const rules = join(
      map(this.rules, rule => indent(rule.toString())),
      "\n\n"
    );

    return `@media ${this.condition} {${rules === "" ? "" : `\n${rules}\n`}}`;
  }
}

export namespace Media {
  export function isMedia(value: unknown): value is Media {
    return value instanceof Media;
  }

  export interface JSON extends Condition.JSON {
    type: "media";
  }

  export function fromMedia(
    media: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Media {
    return Media.of(
      media.condition,
      self => {
        const parent = Option.of(self);
        return media.rules.map(rule => Rule.fromRule(rule, owner, parent));
      },
      owner,
      parent
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
