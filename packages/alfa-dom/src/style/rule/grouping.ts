import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";

export abstract class Grouping extends Rule {
  public readonly rules: Iterable<Rule>;

  protected constructor(
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this.rules = rules(this);
  }

  public *visit(): Iterable<Rule> {
    yield* this.rules;
  }

  public abstract toJSON(): Grouping.JSON;
}

export namespace Grouping {
  export function isGrouping(value: unknown): value is Grouping {
    return value instanceof Grouping;
  }

  export interface JSON extends Rule.JSON {
    rules: Array<Rule.JSON>;
  }
}
