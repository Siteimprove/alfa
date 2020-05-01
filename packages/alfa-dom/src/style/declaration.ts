import { None, Option } from "@siteimprove/alfa-option";
import * as json from "@siteimprove/alfa-json";

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

  private readonly _name: string;
  private readonly _value: string;
  private readonly _important: boolean;
  private readonly _parent: Option<Rule>;

  private constructor(
    name: string,
    value: string,
    important: boolean,
    parent: Option<Rule>
  ) {
    this._name = name;
    this._value = value;
    this._important = important;
    this._parent = parent;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): string {
    return this._value;
  }

  public get important(): boolean {
    return this._important;
  }

  public get parent(): Option<Rule> {
    return this._parent;
  }

  public *ancestors(): Iterable<Rule> {
    for (const parent of this._parent) {
      yield parent;
      yield* parent.ancestors();
    }
  }

  public toJSON(): Declaration.JSON {
    return {
      name: this._name,
      value: this._value,
      important: this._important,
    };
  }

  public toString(): string {
    return `${this._name}: ${this._value}${
      this._important ? " !important" : ""
    }`;
  }
}

export namespace Declaration {
  export interface JSON {
    [key: string]: json.JSON;
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
