import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";

import * as json from "@siteimprove/alfa-json";

import { Media } from "../media";

import { Feature } from "../feature/feature";

import { Negation } from "./negation";

/**
 * Given that they only differ by their #matches() method, Conjuction and Disjunction
 * are grouped together into the (sub-optimal) name "Expression"
 */
export class Expression implements Media.Queryable {
  public static of(
    combinator: Expression.Combinator,
    left: Feature | Expression | Negation,
    right: Feature | Expression | Negation
  ): Expression {
    return new Expression(combinator, left, right);
  }

  private readonly _combinator: Expression.Combinator;
  private readonly _left: Feature | Expression | Negation;
  private readonly _right: Feature | Expression | Negation;

  private constructor(
    operator: Expression.Combinator,
    left: Feature | Expression | Negation,
    right: Feature | Expression | Negation
  ) {
    this._combinator = operator;
    this._left = left;
    this._right = right;
  }

  public get combinator(): Expression.Combinator {
    return this._combinator;
  }

  public get left(): Feature | Expression | Negation {
    return this._left;
  }

  public get right(): Feature | Expression | Negation {
    return this._right;
  }

  public get type(): "expression" {
    return "expression";
  }

  public matches(device: Device): boolean {
    switch (this._combinator) {
      case Expression.Combinator.And:
        return this._left.matches(device) && this._right.matches(device);

      case Expression.Combinator.Or:
        return this._left.matches(device) || this._right.matches(device);
    }
  }

  public equals(value: Expression): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Expression &&
      value._combinator === this._combinator &&
      value._left.equals(this._left) &&
      value._right.equals(this._right)
    );
  }

  public hash(hash: Hash) {
    Hash.writeString(hash, this._combinator);
    this._left.hash(hash);
    this._right.hash(hash);
  }

  public toJSON(): Expression.JSON {
    return {
      type: "expression",
      combinator: this._combinator,
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

  public toString(): string {
    return `(${this._left}) ${this._combinator} (${this._right})`;
  }
}

export namespace Expression {
  export interface JSON {
    [key: string]: json.JSON;
    type: "expression";
    combinator: string;
    left: Feature.JSON | Expression.JSON | Negation.JSON;
    right: Feature.JSON | Expression.JSON | Negation.JSON;
  }

  export enum Combinator {
    And = "and",
    Or = "or",
  }

  export function isCondition(value: unknown): value is Expression {
    return value instanceof Expression;
  }
}
