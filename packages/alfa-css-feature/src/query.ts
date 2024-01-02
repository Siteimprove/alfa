import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Condition, Not } from "./condition";
import { Feature } from "./feature";
import type { Matchable } from "./matchable";
import { Modifier } from "./modifier";
import { Type } from "./type";

const { delimited, either, end, left, map, option, pair, right } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-query}
 *
 * @public
 */
export class Query implements Matchable {
  public static of(
    modifier: Option<Modifier>,
    type: Option<Type>,
    condition: Option<Condition<Feature>>,
  ): Query {
    return new Query(modifier, type, condition);
  }

  private readonly _modifier: Option<Modifier>;
  private readonly _type: Option<Type>;
  private readonly _condition: Option<Condition<Feature>>;

  private constructor(
    modifier: Option<Modifier>,
    type: Option<Type>,
    condition: Option<Condition<Feature>>,
  ) {
    this._modifier = modifier;
    this._type = type;
    this._condition = condition;
  }

  public get modifier(): Option<Modifier> {
    return this._modifier;
  }

  public get type(): Option<Type> {
    return this._type;
  }

  public get condition(): Option<Condition<Feature>> {
    return this._condition;
  }

  public matches(device: Device): boolean {
    const negated = this._modifier.some(
      (modifier) => modifier === Modifier.Not,
    );

    const type = this._type.every((type) => type.matches(device));

    const condition = this.condition.every((condition) =>
      condition.matches(device),
    );

    return negated !== (type && condition);
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Query &&
      value._modifier.equals(this._modifier) &&
      value._type.equals(this._type) &&
      value._condition.equals(this._condition)
    );
  }

  public toJSON(): Query.JSON {
    return {
      modifier: this._modifier.getOr(null),
      type: this._type.map((type) => type.toJSON()).getOr(null),
      condition: this._condition
        .map((condition) => condition.toJSON())
        .getOr(null),
    };
  }

  public toString(): string {
    const modifier = this._modifier.getOr("");

    const type = this._type
      .map((type) => (modifier === "" ? `${type}` : `${modifier} ${type}`))
      .getOr("");

    return this._condition
      .map((condition) =>
        type === "" ? `${condition}` : `${type} and ${condition}`,
      )
      .getOr(type);
  }
}

/**
 * @public
 */
export namespace Query {
  export interface JSON {
    [key: string]: json.JSON;
    modifier: string | null;
    type: Type.JSON | null;
    condition: Condition.JSON<Feature> | null;
  }

  export function isQuery(value: unknown): value is Query {
    return value instanceof Query;
  }

  /**
   * @internal
   */
  export const notAll = Query.of(
    Option.of(Modifier.Not),
    Option.of(Type.of("all")),
    None,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query}
   */
  export const parse = left(
    either(
      map(Condition.parse, (condition) =>
        Query.of(None, None, Option.of(condition)),
      ),
      map(
        pair(
          pair(
            option(delimited(option(Token.parseWhitespace), Modifier.parse)),
            Type.parse,
          ),
          option(
            right(
              delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
              Condition.parseWithoutOr,
            ),
          ),
        ),
        ([[modifier, type], condition]) =>
          Query.of(modifier, Option.of(type), condition),
      ),
    ),
    end(() => `Unexpected token`),
  );
}
