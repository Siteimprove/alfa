import { None, Option } from "@siteimprove/alfa-option";

import { Sheet } from "./sheet";

export abstract class Rule {
  public readonly owner: Sheet;
  public readonly parent: Option<Rule>;

  protected constructor(owner: Sheet, parent: Option<Rule>) {
    this.owner = owner;
    this.parent = parent;
  }

  public *visit(): Iterable<Rule> {}

  public *iterate(): Iterable<Rule> {
    for (const child of this.visit()) {
      yield child;
      yield* child.iterate();
    }
  }

  public abstract toJSON(): Rule.JSON;
}

import { Media } from "./rule/media";
import { Style } from "./rule/style";

export namespace Rule {
  export interface JSON {
    type: string;
  }

  export function fromRule(
    rule: JSON,
    owner: Sheet,
    parent: Option<Rule> = None
  ): Rule {
    switch (rule.type) {
      case "style":
        return Style.fromStyle(rule as Style.JSON, owner, parent);

      case "media":
        return Media.fromMedia(rule as Media.JSON, owner, parent);

      default:
        throw new Error(`Unexpected rule of type: ${rule.type}`);
    }
  }
}
