import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

import { Condition } from "./condition";
import { Type } from "./type";

const {
  map,
  either,
  option,
  pair,
  left,
  right,
  delimited,
  separatedList,
  eof,
} = Parser;

export namespace Media {
  export interface Queryable<T extends json.JSON = json.JSON>
    extends Equatable,
      Serializable<T> {
    matches: Predicate<Device>;
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

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<=",
  }

  export const { of: type, isType } = Type;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query
   */
  export class Query implements Queryable<Query.JSON> {
    public static of(
      modifier: Option<Modifier>,
      mediaType: Option<Type>,
      condition: Option<Condition.Condition>
    ): Query {
      return new Query(modifier, mediaType, condition);
    }

    private readonly _modifier: Option<Modifier>;
    private readonly _mediaType: Option<Type>;
    private readonly _condition: Option<Condition.Condition>;

    private constructor(
      modifier: Option<Modifier>,
      mediaType: Option<Type>,
      condition: Option<Condition.Condition>
    ) {
      this._modifier = modifier;
      this._mediaType = mediaType;
      this._condition = condition;
    }

    public get modifier(): Option<Modifier> {
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
        (modifier) => modifier === Modifier.Not
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
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query
   */
  const parseQuery = either(
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

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List implements Iterable<Query>, Queryable<List.JSON> {
    public static of(queries: Iterable<Query>): List {
      return new List(queries);
    }

    private readonly _queries: Array<Query>;

    private constructor(queries: Iterable<Query>) {
      this._queries = Array.from(queries);
    }

    public get queries(): Iterable<Query> {
      return this._queries;
    }

    public matches(device: Device): boolean {
      return (
        this._queries.length === 0 ||
        this._queries.some((query) => query.matches(device))
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof List &&
        value._queries.length === this._queries.length &&
        value._queries.every((query, i) => query.equals(this._queries[i]))
      );
    }

    public *[Symbol.iterator](): Iterator<Query> {
      yield* this._queries;
    }

    public toJSON(): List.JSON {
      return this._queries.map((query) => query.toJSON());
    }

    public toString(): string {
      return this._queries.join(", ");
    }
  }

  export namespace List {
    export type JSON = Array<Query.JSON>;
  }

  const parseList = left(
    map(
      separatedList(
        parseQuery,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (queries) => List.of(queries)
    ),
    eof((token) => `Unexpected token ${token}`)
  );

  export const parse = parseList;
}
