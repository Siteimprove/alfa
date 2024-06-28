import type { Rule } from "../rule.js";
import { GroupingRule } from "./grouping.js";

/**
 * @public
 */
export abstract class ConditionRule<
  T extends string = string,
> extends GroupingRule<T> {
  protected readonly _condition: string;

  protected constructor(type: T, condition: string, rules: Array<Rule>) {
    super(type, rules);

    this._condition = condition;
  }

  public get condition(): string {
    return this._condition;
  }

  public toJSON(): ConditionRule.JSON<T> {
    return {
      ...super.toJSON(),
      condition: this._condition,
    };
  }
}

/**
 * @public
 */
export namespace ConditionRule {
  export interface JSON<T extends string = string>
    extends GroupingRule.JSON<T> {
    condition: string;
  }

  export function isConditionRule(value: unknown): value is ConditionRule {
    return value instanceof ConditionRule;
  }
}
