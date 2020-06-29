import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

export class Declaration implements Equatable, Serializable {
  public static of(
    name: string,
    value: string,
    important = false
  ): Declaration {
    return new Declaration(name, value, important);
  }

  private readonly _name: string;
  private readonly _value: string;
  private readonly _important: boolean;
  private _parent: Option<Rule> = None;

  private constructor(name: string, value: string, important: boolean) {
    this._name = name;
    this._value = value;
    this._important = important;
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

  public equals(value: unknown): value is this {
    return (
      value instanceof Declaration &&
      value._name === this._name &&
      value._value === this._value &&
      value._important === this._important
    );
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

  /**
   * @internal
   */
  public _attachParent(parent: Rule): boolean {
    if (this._parent.isSome()) {
      return false;
    }

    this._parent = Option.of(parent);

    return true;
  }
}

export namespace Declaration {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    value: string;
    important: boolean;
  }

  export function from(json: JSON): Declaration {
    return Declaration.of(json.name, json.value, json.important);
  }
}
