import { Equatable } from "@siteimprove/alfa-equatable";

import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

/**
 * @public
 */
export abstract class Outcome<I, T, Q = never>
  implements Equatable, json.Serializable<Outcome.JSON> {
  protected readonly _rule: Rule<I, T, Q>;

  protected constructor(rule: Rule<I, T, Q>) {
    this._rule = rule;
  }

  public get rule(): Rule<I, T, Q> {
    return this._rule;
  }

  public get target(): T | undefined {
    return undefined;
  }

  public abstract equals<I, T, Q>(value: Outcome<I, T, Q>): boolean;

  public abstract equals(value: unknown): value is this;

  public abstract toJSON(): Outcome.JSON;
}

/**
 * @public
 */
export namespace Outcome {
  export interface JSON<O extends string = string> {
    [key: string]: json.JSON;
    outcome: O;
    rule: Rule.JSON;
  }
}
