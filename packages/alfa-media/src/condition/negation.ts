import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";

import { Media } from "../media";

import { Feature } from "../feature/feature";

import { Expression } from "./expression";

import * as json from "@siteimprove/alfa-json";

export class Negation implements Media.Queryable {
  public static of(condition: Feature | Expression | Negation): Negation {
    return new Negation(condition);
  }

  private readonly _condition: Feature | Expression | Negation;

  private constructor(condition: Feature | Expression | Negation) {
    this._condition = condition;
  }

  public get condition(): Feature | Expression | Negation {
    return this._condition;
  }

  public get type(): "negation" {
    return "negation";
  }

  public matches(device: Device): boolean {
    return !this._condition.matches(device);
  }

  public equals(value: Negation): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Negation && value._condition.equals(this._condition)
    );
  }

  public hash(hash: Hash) {
    this._condition.hash(hash);
  }

  public toJSON(): Negation.JSON {
    return {
      type: "negation",
      condition: this._condition.toJSON(),
    };
  }

  public toString(): string {
    return `not (${this._condition})`;
  }
}

export namespace Negation {
  export interface JSON {
    [key: string]: json.JSON;
    type: "negation";
    condition: Feature.JSON | Expression.JSON | Negation.JSON;
  }

  export function isNegation(value: unknown): value is Negation {
    return value instanceof Negation;
  }
}
