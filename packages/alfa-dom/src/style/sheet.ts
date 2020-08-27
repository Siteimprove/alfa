import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

export class Sheet implements Equatable, Serializable {
  public static of(
    rules: Iterable<Rule>,
    disabled = false,
    condition: Option<string> = None
  ): Sheet {
    return new Sheet(Array.from(rules), disabled, condition);
  }

  public static empty(): Sheet {
    return new Sheet([], false, None);
  }

  private _rules: Array<Rule>;
  private readonly _disabled: boolean;
  private readonly _condition: Option<string>;

  private constructor(
    rules: Array<Rule>,
    disabled: boolean,
    condition: Option<string>
  ) {
    this._rules = rules.filter((rule) => rule._attachOwner(this));
    this._disabled = disabled;
    this._condition = condition;
  }

  public get rules(): Iterable<Rule> {
    return this._rules;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get condition(): Option<string> {
    return this._condition;
  }

  public *children(): Iterable<Rule> {
    yield* this._rules;
  }

  public *descendants(): Iterable<Rule> {
    for (const child of this.children()) {
      yield child;
      yield* child.descendants();
    }
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Sheet &&
      value._disabled === this._disabled &&
      value._condition.equals(this._condition) &&
      value._rules.length === this._rules.length &&
      value._rules.every((rule, i) => rule.equals(this._rules[i]))
    );
  }

  public toJSON(): Sheet.JSON {
    return {
      rules: [...this._rules].map((rule) => rule.toJSON()),
      disabled: this._disabled,
      condition: this._condition.getOr(null),
    };
  }

  public toString(): string {
    return this._rules.join("\n");
  }
}

export namespace Sheet {
  export interface JSON {
    [key: string]: json.JSON;
    rules: Array<Rule.JSON>;
    disabled: boolean;
    condition: string | null;
  }

  export function from(json: JSON): Sheet {
    return Sheet.of(
      json.rules.map(Rule.from),
      json.disabled,
      Option.from(json.condition)
    );
  }
}
