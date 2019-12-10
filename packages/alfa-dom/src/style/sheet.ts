import { Mapper } from "@siteimprove/alfa-mapper";

import { Rule } from "./rule";

export class Sheet {
  public static of(
    rules: Mapper<Sheet, Iterable<Rule>>,
    disabled = false
  ): Sheet {
    return new Sheet(rules, disabled);
  }

  public readonly rules: Iterable<Rule>;
  public readonly disabled: boolean;

  private constructor(rules: Mapper<Sheet, Iterable<Rule>>, disabled: boolean) {
    this.rules = Array.from(rules(this));
    this.disabled = disabled;
  }

  public *children(): Iterable<Rule> {
    yield* this.rules;
  }

  public *descendants(): Iterable<Rule> {
    for (const child of this.children()) {
      yield child;
      yield* child.descendants();
    }
  }

  public toJSON(): Sheet.JSON {
    return {
      rules: [...this.rules].map(rule => rule.toJSON()),
      disabled: this.disabled
    };
  }
}

export namespace Sheet {
  export interface JSON {
    rules: Array<Rule.JSON>;
    disabled: boolean;
  }

  export function fromSheet(sheet: JSON): Sheet {
    return Sheet.of(self => {
      return sheet.rules.map(rule => Rule.fromRule(rule, self));
    }, sheet.disabled);
  }
}
