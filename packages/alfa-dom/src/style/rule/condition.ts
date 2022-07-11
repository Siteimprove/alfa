import { Result } from "@siteimprove/alfa-result";
import { Rule } from "../rule";
import { GroupingRule } from "./grouping";

/**
 * @public
 */
export abstract class ConditionRule extends GroupingRule {
  protected readonly _condition: string;

  protected constructor(condition: string, rules: Array<Rule>) {
    super(rules);

    this._condition = condition;
  }

  public get condition(): string {
    return this._condition;
  }

  // Due to the order of dependencies, this is at a lower level (DOM) than the
  // CSS parser (CSS). So we can't use the correct type here.
  // The value getter therefore needs to be called with such a parser.
  //
  // This is somewhat type unsafe since we cannot guarantee that
  // ConditionRule#value won't be called with another parser.
  private _value: Result<any, string> | undefined = undefined;

  /**
   * Do not use directly.
   * Use the wrapper Media.parseMediaCondition in alfa-media
   *
   * @internal
   */
  public value<T>(
    parser: (condition: string) => Result<T, string>
  ): Result<T, string> {
    if (this._value === undefined) {
      this._value = parser(this._condition);
    }

    return this._value as Result<T, string>;
  }

  public abstract toJSON(): ConditionRule.JSON;
}

/**
 * @public
 */
export namespace ConditionRule {
  export interface JSON extends GroupingRule.JSON {
    condition: string;
  }

  export function isConditionRule(value: unknown): value is ConditionRule {
    return value instanceof ConditionRule;
  }
}
