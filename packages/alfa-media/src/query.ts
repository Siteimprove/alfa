import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Feature } from "./feature/feature";
import { Type } from "./type";
import { Condition, Expression, Negation } from "./condition";
import { Media } from "./media";

import * as json from "@siteimprove/alfa-json";

const { delimited, either, left, map, option, pair, right } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-query
 */
export class Query implements Media.Queryable {
  public static of(
    modifier: Option<Query.Modifier>,
    mediaType: Option<Type>,
    condition: Option<Feature | Expression | Negation>
  ): Query {
    return new Query(modifier, mediaType, condition);
  }

  private readonly _modifier: Option<Query.Modifier>;
  private readonly _mediaType: Option<Type>;
  private readonly _condition: Option<Feature | Expression | Negation>;

  private constructor(
    modifier: Option<Query.Modifier>,
    type: Option<Type>,
    condition: Option<Feature | Expression | Negation>
  ) {
    this._modifier = modifier;
    this._mediaType = type;
    this._condition = condition;
  }

  public get modifier(): Option<Query.Modifier> {
    return this._modifier;
  }

  public get mediaType(): Option<Type> {
    return this._mediaType;
  }

  public get condition(): Option<Feature | Expression | Negation> {
    return this._condition;
  }

  public get type(): "query" {
    return "query";
  }

  public matches(device: Device): boolean {
    const negated = this._modifier.some(
      (modifier) => modifier === Query.Modifier.Not
    );
    const type = this._mediaType.every((type) => type.matches(device));
    const condition = this.condition.every((condition) =>
      condition.matches(device)
    );

    return negated !== (type && condition);
  }

  public equals(value: Query): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Query &&
      value._modifier.equals(this._modifier) &&
      value._mediaType.equals(this._mediaType) &&
      value._condition.equals(this._condition)
    );
  }

  public hash(hash: Hash) {
    this._modifier.hash(hash);
    this._mediaType.hash(hash);
    this._condition.hash(hash);
  }

  public toJSON(): Query.JSON {
    return {
      type: "query",
      modifier: this._modifier.getOr(null),
      mediaType: this._mediaType.map((type) => type.toJSON()).getOr(null),
      condition: this._condition
        .map((condition) => condition.toJSON())
        .getOr(null),
    };
  }

  public toString(): string {
    const modifier = this._modifier.getOr("");

    const type = this._mediaType
      .map((type) => (modifier === "" ? `${type}` : `${modifier} ${type}`))
      .getOr("");

    return this._condition
      .map((condition) =>
        type === "" ? `${condition}` : `${type} and ${condition}`
      )
      .getOr(type);
  }
}

export namespace Query {
  export interface JSON {
    [key: string]: json.JSON;
    type: "query";
    modifier: string | null;
    mediaType: Type.JSON | null;
    condition: Feature.JSON | Expression.JSON | Negation.JSON | null;
  }

  export function isQuery(value: unknown): value is Query {
    return value instanceof Query;
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-modifier
   */
  export enum Modifier {
    Only = "only",
    Not = "not",
  }

  const parseModifier = either(
    map(Token.parseIdent("only"), () => Modifier.Only),
    map(Token.parseIdent("not"), () => Modifier.Not)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query
   */
  export const parse = either(
    map(Condition.parse, (condition) =>
      Query.of(None, None, Option.of(condition))
    ),
    map(
      pair(
        pair(option(left(parseModifier, Token.parseWhitespace)), Type.parse),
        option(
          right(
            delimited(Token.parseWhitespace, Token.parseIdent("and")),
            Condition.parseWithoutOr
          )
        )
      ),
      (result) => {
        const [[modifier, type], condition] = result;
        return Query.of(modifier, Option.of(type), condition);
      }
    )
  );
}
