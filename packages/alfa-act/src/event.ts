import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Rule } from "./rule";

/**
 * @public
 */
export class Event<
  INPUT,
  TARGET,
  QUESTION,
  SUBJECT,
  TYPE extends Event.Type = Event.Type,
  NAME extends string = string
> implements Serializable<Event.JSON<TYPE, NAME>>
{
  public static of<
    INPUT,
    TARGET,
    QUESTION,
    SUBJECT,
    TYPE extends Event.Type,
    NAME extends string
  >(
    type: TYPE,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    name: NAME
  ): Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
    return new Event(type, rule, name);
  }

  private readonly _type: TYPE;
  private readonly _rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>;
  private readonly _name: NAME;

  constructor(
    type: TYPE,
    rule: Rule<INPUT, TARGET, QUESTION, SUBJECT>,
    name: NAME
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
    TARGET,
    QUESTION,
    SUBJECT,
    TYPE extends Event.Type = Event.Type,
    NAME extends string = string
  >(
    value: unknown
  ): value is Event<INPUT, TARGET, QUESTION, SUBJECT, TYPE, NAME> {
    return value instanceof Event;
  }

  export function start<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "rule"> {
    return Event.of("start", rule, "rule");
  }

  export function end<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "rule"> {
    return Event.of("end", rule, "rule");
  }

  export function startApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "applicability"> {
    return Event.of("start", rule, "applicability");
  }

  export function endApplicability<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "applicability"> {
    return Event.of("end", rule, "applicability");
  }

  export function startExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "start", "expectation"> {
    return Event.of("start", rule, "expectation");
  }

  export function endExpectation<I, T, Q, S>(
    rule: Rule<I, T, Q, S>
  ): Event<I, T, Q, S, "end", "expectation"> {
    return Event.of("end", rule, "expectation");
  }
}
