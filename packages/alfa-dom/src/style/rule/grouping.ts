import { Rule } from "../rule";

export abstract class GroupingRule extends Rule {
  protected readonly _rules: Array<Rule>;

  protected constructor(rules: Array<Rule>) {
    super();

    this._rules = rules.filter((rule) => rule._attachParent(this));
  }

  public get rules(): Iterable<Rule> {
    return this._rules;
  }

  public *children(): Iterable<Rule> {
    yield* this._rules;
  }

  public abstract toJSON(): GroupingRule.JSON;
}

export namespace GroupingRule {
  export interface JSON extends Rule.JSON {
    rules: Array<Rule.JSON>;
  }

  export function isGroupingRule(value: unknown): value is GroupingRule {
    return value instanceof GroupingRule;
  }
}
