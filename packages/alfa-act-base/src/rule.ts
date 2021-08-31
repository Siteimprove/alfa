import { Array } from "@siteimprove/alfa-array";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";

import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import { Outcome } from "./outcome";
import { Tag } from "./tag";

/**
 * @public
 */
export abstract class Rule<I = unknown, T = unknown, Q = never, S = T>
  implements
    Equatable,
    json.Serializable<Rule.JSON>,
    sarif.Serializable<sarif.ReportingDescriptor>
{
  protected readonly _uri: string;
  protected readonly _tags: Array<Tag>;
  protected readonly _evaluate: Rule.Evaluate<I, T, Q, S>;

  protected constructor(
    uri: string,
    tags: Array<Tag>,
    evaluator: Rule.Evaluate<I, T, Q, S>
  ) {
    this._uri = uri;
    this._tags = tags;
    this._evaluate = evaluator;
  }

  public get uri(): string {
    return this._uri;
  }

  public get tags(): ReadonlyArray<Tag> {
    return this._tags;
  }

  public hasTag(tag: Tag): boolean {
    return Array.includes(this._tags, tag);
  }

  public evaluate(input: I): Future<Iterable<Outcome<I, T, Q, S>>> {
    return this._evaluate(input);
  }

  public equals<I, T, Q, S>(value: Rule<I, T, Q, S>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Rule && value._uri === this._uri;
  }

  public abstract toJSON(): Rule.JSON;

  public toSARIF(): sarif.ReportingDescriptor {
    return {
      id: this._uri,
      helpUri: this._uri,
    };
  }
}

/**
 * @public
 */
export namespace Rule {
  export interface JSON {
    [key: string]: json.JSON;
    type: string;
    uri: string;
    tags: Array<Tag.JSON>;
  }

  export type Input<R> = R extends Rule<infer I, any, any, any> ? I : never;

  export type Target<R> = R extends Rule<any, infer T, any, any> ? T : never;

  export type Question<R> = R extends Rule<any, any, infer Q, any> ? Q : never;

  export type Subject<R> = R extends Rule<any, any, any, infer S> ? S : never;

  export function isRule<I, T, Q, S>(
    value: unknown
  ): value is Rule<I, T, Q, S> {
    return value instanceof Rule;
  }

  export interface Evaluate<I, T, Q, S> {
    (input: Readonly<I>): Future<Iterable<Outcome<I, T, Q, S>>>;
  }
}
