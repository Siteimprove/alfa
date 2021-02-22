import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Condition } from "./condition";
import { Media } from "./media";
import { Type } from "./type";

const { map, either, option, pair, right, delimited } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-query
 */
export class Query implements Media.Queryable<Query.JSON> {
  public static of(
    modifier: Option<Query.Modifier>,
    mediaType: Option<Type>,
    condition: Option<Condition.Condition>
  ): Query {
    return new Query(modifier, mediaType, condition);
  }

  private readonly _modifier: Option<Query.Modifier>;
  private readonly _mediaType: Option<Type>;
  private readonly _condition: Option<Condition.Condition>;

  private constructor(
    modifier: Option<Query.Modifier>,
    mediaType: Option<Type>,
    condition: Option<Condition.Condition>
  ) {
    this._modifier = modifier;
    this._mediaType = mediaType;
    this._condition = condition;
  }

  public get modifier(): Option<Query.Modifier> {
    return this._modifier;
  }

  public get mediaType(): Option<Type> {
    return this._mediaType;
  }

  public get condition(): Option<Condition.Condition> {
    return this._condition;
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

  public equals(value: unknown): value is this {
    return (
      value instanceof Query &&
      value._modifier.equals(this._modifier) &&
      value._mediaType.equals(this._mediaType) &&
      value._condition.equals(this._condition)
    );
  }

  public toJSON(): Query.JSON {
    return {
      modifier: this._modifier.getOr(null),
      mediaType: this._mediaType.map((type) => type.toJSON()).getOr(null),
      condition: this._condition
        .map((condition) => condition.toJSON())
        .getOr(null),
      type: "query",
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
    modifier: string | null;
    mediaType: Type.JSON | null;
    condition: Condition.JSON | null;
    type: "query";
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
        pair(
          option(delimited(option(Token.parseWhitespace), parseModifier)),
          Type.parse
        ),
        option(
          right(
            delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
            Condition.parseWithoutOr
          )
        )
      ),
      ([[modifier, type], condition]) =>
        Query.of(modifier, Option.of(type), condition)
    )
  );
}
