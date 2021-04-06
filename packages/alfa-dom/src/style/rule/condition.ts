import { Rule } from "../rule";
import { GroupingRule } from "./grouping";

export abstract class ConditionRule extends GroupingRule {
  protected readonly _condition: string;

  protected constructor(condition: string, rules: Array<Rule>) {
    super(rules);

    this._condition = condition;
  }

  public get condition(): string {
    return this._condition;
  }

  public abstract toJSON(): ConditionRule.JSON;
}

export namespace ConditionRule {
  export interface JSON extends GroupingRule.JSON {
    condition: string;
  }

  export function isConditionRule(value: unknown): value is ConditionRule {
    return value instanceof ConditionRule;
  }
}
