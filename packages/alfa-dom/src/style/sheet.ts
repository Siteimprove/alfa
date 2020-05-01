import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

export class Sheet {
  public static of(
    rules: Mapper<Sheet, Iterable<Rule>>,
    disabled = false,
    condition: Option<string> = None
  ): Sheet {
    return new Sheet(rules, disabled, condition);
  }

  public static empty(): Sheet {
    return new Sheet(() => [], false, None);
  }

  private readonly _rules: Array<Rule>;
  private readonly _disabled: boolean;
  private readonly _condition: Option<string>;

  private constructor(
    rules: Mapper<Sheet, Iterable<Rule>>,
    disabled: boolean,
    condition: Option<string>
  ) {
    this._rules = Array.from(rules(this));
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

  public toJSON(): Sheet.JSON {
    return {
      rules: [...this._rules].map((rule) => rule.toJSON()),
      disabled: this._disabled,
      condition: this._condition.getOr(null),
    };
  }
}

export namespace Sheet {
  export interface JSON {
    [key: string]: json.JSON;
    rules: Array<Rule.JSON>;
    disabled: boolean;
    condition: string | null;
  }

  export function fromSheet(sheet: JSON): Sheet {
    return Sheet.of(
      (self) => {
        return sheet.rules.map((rule) => Rule.fromRule(rule, self));
      },
      sheet.disabled,
      Option.from(sheet.condition)
    );
  }
}
