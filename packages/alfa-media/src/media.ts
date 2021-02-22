import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

import { Query } from "./query";
import { Type } from "./type";

const { delimited, eof, left, map, option, separatedList } = Parser;

export namespace Media {
  export interface Queryable<T extends json.JSON = json.JSON>
    extends Equatable,
      Serializable<T> {
    matches: Predicate<Device>;
  }

  export const { of: type, isType } = Type;

  export const { of: query, isQuery } = Query;

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

    export function isList(value: unknown): value is List {
      return value instanceof List;
    }

    export const parse = left(
      map(
        separatedList(
          Query.parse,
          delimited(option(Token.parseWhitespace), Token.parseComma)
        ),
        (queries) => List.of(queries)
      ),
      eof((token) => `Unexpected token ${token}`)
    );
  }

  export const parse = List.parse;
}
