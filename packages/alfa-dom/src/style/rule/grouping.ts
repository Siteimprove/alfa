import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";

import { Rule } from "../rule";
import { Sheet } from "../sheet";

export abstract class Grouping extends Rule {
  protected readonly _rules: Array<Rule>;

  protected constructor(
    rules: Mapper<Grouping, Iterable<Rule>>,
    owner: Sheet,
    parent: Option<Rule>
  ) {
    super(owner, parent);

    this._rules = Array.from(rules(this));
  }

  public get rules(): Iterable<Rule> {
    return this._rules;
  }

  public *children(): Iterable<Rule> {
    yield* this._rules;
  }

  public abstract toJSON(): Grouping.JSON;
}

export namespace Grouping {
  export interface JSON extends Rule.JSON {
    rules: Array<Rule.JSON>;
  }

  export function isGrouping(value: unknown): value is Grouping {
    return value instanceof Grouping;
  }
}
