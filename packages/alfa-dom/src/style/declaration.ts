import { None, Option } from "@siteimprove/alfa-option";

import { Rule } from "./rule";

export class Declaration {
  public static of(
    name: string,
    value: string,
    important = false,
    parent: Option<Rule> = None
  ): Declaration {
    return new Declaration(name, value, important, parent);
  }

  public readonly name: string;
  public readonly value: string;
  public readonly important: boolean;
  public readonly parent: Option<Rule>;

  private constructor(
    name: string,
    value: string,
    important: boolean,
    parent: Option<Rule>
  ) {
    this.name = name;
    this.value = value;
    this.important = important;
    this.parent = parent;
  }

  public toJSON(): Declaration.JSON {
    return {
      name: this.name,
      value: this.value,
      important: this.important
    };
  }

  public toString(): string {
    return `${this.name}: ${this.value}${this.important ? " !important" : ""}`;
  }
}

export namespace Declaration {
  export interface JSON {
    name: string;
    value: string;
    important: boolean;
  }

  export function fromDeclaration(
    declaration: JSON,
    parent: Option<Rule> = None
  ): Declaration {
    return Declaration.of(
      declaration.name,
      declaration.value,
      declaration.important,
      parent
    );
  }
}
