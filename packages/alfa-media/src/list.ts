import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Query } from "./query";
import { Media } from "./media";

const { delimited, map, option, separatedList } = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-query-list
 */
export class List implements Iterable<Query>, Media.Queryable {
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

  public equals(value: List): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof List &&
      value._queries.length === this._queries.length &&
      value._queries.every((query, i) => query.equals(this._queries[i]))
    );
  }

  public hash(hash: Hash) {
    for (const query of this._queries) {
      query.hash(hash);
    }
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

  export const parse = map(
    separatedList(
      Query.parse,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (queries) => List.of(queries)
  );
}
