import { Array } from "@siteimprove/alfa-array";
import { Rule } from "../rule";

/**
 * @public
 */
export abstract class GroupingRule<T extends string = string> extends Rule<T> {
  protected readonly _rules: Array<Rule>;

  protected constructor(type: T, rules: Array<Rule>) {
    super(type);

    this._rules = rules.filter((rule) => rule._attachParent(this));
  }

  public get rules(): Iterable<Rule> {
    return this._rules;
  }

  public *children(): Iterable<Rule> {
    yield* this._rules;
  }

  public toJSON(): GroupingRule.JSON<T> {
    return {
      ...super.toJSON(),
      rules: Array.toJSON(this._rules),
    };
  }
}

/**
 * @public
 */
export namespace GroupingRule {
  export interface JSON<T extends string = string> extends Rule.JSON<T> {
    rules: Array<Rule.JSON>;
  }

  export function isGroupingRule(value: unknown): value is GroupingRule {
    return value instanceof GroupingRule;
  }
}
