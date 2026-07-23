import type { Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";

import type * as json from "@siteimprove/alfa-json";

import type { Question } from "../expectation/index.ts";

import type { Rule } from "./index.ts";

/**
 * @public
 */
export class Event<
  INPUT,
  TARGET extends Hashable,
  QUESTION extends Question.Metadata,
  SUBJECT,
  TYPE extends Event.Type = Event.Type,
  NAME extends string = string,
> implements Serializable<Event.JSON<TYPE, NAME>> {
  public static of<
    INPUT,
    TARGET extends Hashable,
    QUESTION extends Question.Metadata,
    SUBJECT,
    TYPE extends Event.Type,
    NAME extends string,
  >(
    type: TYPE,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    name: NAME,
  ): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
    return new Event(type, rule, name);
  }

  private readonly _type: TYPE;
  private readonly _rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>;
  private readonly _name: NAME;

  constructor(
    type: TYPE,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    name: NAME,
  ) {
    this._type = type;
    this._rule = rule;
    this._name = name;
  }

  public get type(): TYPE {
    return this._type;
  }

  public get rule(): Rule<INPUT, TARGET, QUESTION, SUBJECT> {
    return this._rule;
  }

  public get name(): NAME {
    return this._name;
  }

  public toJSON(): Event.JSON<TYPE, NAME> {
    return {
      type: this._type,
      rule: this._rule.toJSON(),
      name: this._name,
    };
  }
}

/**
 * @public
 */
export namespace Event {
  export type Type = "start" | "end";

  export interface JSON<T extends Type = Type, N extends string = string> {
    [key: string]: json.JSON;
    type: T;
    rule: Rule.JSON;
    name: N;
  }

  export function isEvent<
    INPUT,
    TARGET extends Hashable,
    QUESTION extends Question.Metadata,
    SUBJECT,
    TYPE extends Event.Type = Event.Type,
    NAME extends string = string,
  >(
    value: unknown,
  ): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
    return value instanceof Event;
  }
}
