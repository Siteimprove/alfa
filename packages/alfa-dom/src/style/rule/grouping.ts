import { Array } from "@siteimprove/alfa-array";
import { BaseRule } from "./rule.js";

/**
 * @public
 */
export abstract class GroupingRule<
  T extends string = string,
> extends BaseRule<T> {
  protected readonly _rules: Array<BaseRule>;

  protected constructor(type: T, rules: Array<BaseRule>) {
    super(type);

    this._rules = rules.filter((rule) => rule._attachParent(this));
  }

  public get rules(): Iterable<BaseRule> {
    return this._rules;
  }

  public *children(): Iterable<BaseRule> {
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
  export interface JSON<T extends string = string> extends BaseRule.JSON<T> {
    rules: Array<BaseRule.JSON>;
  }

  export function isGroupingRule(value: unknown): value is GroupingRule {
    return value instanceof GroupingRule;
  }
}
