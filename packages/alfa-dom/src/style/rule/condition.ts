import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";
import { Grouping } from "./grouping";

export abstract class Condition extends Grouping {
  public readonly condition: string;

  protected constructor(
    condition: string,
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(rules, owner, parent);

    this.condition = condition;
  }

  public abstract toJSON(): Condition.JSON;
}

export namespace Condition {
  export function isCondition(value: unknown): value is Condition {
    return value instanceof Condition;
  }

  export interface JSON extends Grouping.JSON {
    condition: string;
  }
}
