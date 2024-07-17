import type { Device } from "@siteimprove/alfa-device";
import { Parser } from "@siteimprove/alfa-parser";

import type * as json from "@siteimprove/alfa-json";

import { Condition } from "../condition/index.js";
import type { Feature } from "../feature.js";

import { Property } from "./feature/index.js";

const { end, left, map } = Parser;

/**
 * {@link https://drafts.csswg.org/css-conditional-3/#at-supports}
 *
 * @remarks
 * Supports query are just a wrapper for a condition.
 *
 * @public
 */
export class Query implements Feature<Condition<Property>, Query.JSON> {
  public static of(condition: Condition<Property>): Query {
    return new Query(condition);
  }

  private readonly _condition: Condition<Property>;

  private constructor(condition: Condition<Property>) {
    this._condition = condition;
  }

  public get condition(): Condition<Property> {
    return this._condition;
  }

  public matches(device: Device): boolean {
    return this._condition.matches(device);
  }

  private *iterator(): Iterator<Condition<Property>> {
    yield* this._condition;
  }

  public [Symbol.iterator](): Iterator<Condition<Property>> {
    return this.iterator();
  }

  public equals(value: unknown): value is this {
    return value instanceof Query && value._condition.equals(this._condition);
  }

  public toJSON(): Query.JSON {
    return { condition: this._condition.toJSON() };
  }

  public toString(): string {
    return this._condition.toString();
  }
}

/**
 * @public
 */
export namespace Query {
  export interface JSON {
    [key: string]: json.JSON;

    condition: Condition.JSON<Property>;
  }

  export function isQuery(value: unknown): value is Query {
    return value instanceof Query;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query}
   */
  export const parse = left(
    map(Condition.parse(Property.parse), Query.of),
    end(() => `Unexpected token`),
  );
}
