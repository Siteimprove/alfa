import { Rule } from "../rule";
import { Grouping } from "./grouping";

export abstract class Condition extends Grouping {
  protected readonly _condition: string;

  protected constructor(condition: string, rules: Array<Rule>) {
    super(rules);

    this._condition = condition;
  }

  public get condition(): string {
    return this._condition;
  }

  public abstract toJSON(): Condition.JSON;
}

export namespace Condition {
  export interface JSON extends Grouping.JSON {
    condition: string;
  }

  export function isCondition(value: unknown): value is Condition {
    return value instanceof Condition;
  }
}
