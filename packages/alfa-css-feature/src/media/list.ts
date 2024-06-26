import { Component, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import type { Feature } from "../feature.js";

import { Query } from "./query.js";

const { either, end, map, separatedList, takeUntil } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-query-list}
 *
 * @public
 */
export class List implements Feature<Query, List.JSON> {
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

/**
 * @public
 */
export namespace List {
  export type JSON = Array<Query.JSON>;

  export function isList(value: unknown): value is List {
    return value instanceof List;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
   */
  export const parse = map(
    separatedList(
      map(
        takeUntil(
          Component.consume,
          either(
            Token.parseComma,
            end(() => `Unexpected token`),
          ),
        ),
        (components) => Iterable.flatten(components),
      ),
      Token.parseComma,
    ),
    (queries) =>
      List.of(
        Iterable.map(queries, (tokens) =>
          Query.parse(Slice.from(tokens).trim(Token.isWhitespace))
            .map(([, query]) => query)
            .getOr(Query.notAll),
        ),
      ),
  );
}
