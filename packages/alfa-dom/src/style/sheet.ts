import { Mapper } from "@siteimprove/alfa-mapper";
import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

export class Sheet {
  public static of(
    rules: Mapper<Sheet, Iterable<Rule>>,
    disabled = false
  ): Sheet {
    return new Sheet(rules, disabled);
  }

  public static empty(): Sheet {
    return new Sheet(() => [], false);
  }

  private readonly _rules: Array<Rule>;
  private readonly _disabled: boolean;

  private constructor(rules: Mapper<Sheet, Iterable<Rule>>, disabled: boolean) {
    this._rules = Array.from(rules(this));
    this._disabled = disabled;
  }

  public get rules(): Iterable<Rule> {
    return this._rules;
  }

  public get disabled(): boolean {
    return this._disabled;
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
      rules: [...this._rules].map(rule => rule.toJSON()),
      disabled: this._disabled
    };
  }
}

export namespace Sheet {
  export interface JSON {
    [key: string]: json.JSON;
    rules: Array<Rule.JSON>;
    disabled: boolean;
  }

  export function fromSheet(sheet: JSON): Sheet {
    return Sheet.of(self => {
      return sheet.rules.map(rule => Rule.fromRule(rule, self));
    }, sheet.disabled);
  }
}
