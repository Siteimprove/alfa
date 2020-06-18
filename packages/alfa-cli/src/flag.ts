import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";
import * as parser from "@siteimprove/alfa-parser";

/**
 * @internal
 */
export class Flag<T = unknown> implements Functor<T>, Serializable {
  public static of<T>(
    name: string,
    description: string,
    parse: Flag.Parser<T>
  ): Flag<T> {
    const options: Flag.Options<T> = {
      type: None,
      aliases: [],
      optional: false,
      repeatable: false,
      default: None,
    };

    return new Flag(
      name,
      description.replace(/\s+/g, " ").trim(),
      options,
      parse,
      (_, next) => next
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Flag.Options<T>;
  private readonly _parse: Flag.Parser<T>;
  private readonly _join: Flag.Joiner<T>;

  private constructor(
    name: string,
    description: string,
    options: Flag.Options<T>,
    parse: Flag.Parser<T>,
    join: Flag.Joiner<T>
  ) {
    this._name = name;
    this._description = description;
    this._options = options;
    this._parse = parse;
    this._join = join;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get options(): Flag.Options<T> {
    return this._options;
  }

  public get parse(): Flag.Parser<T> {
    return this._parse;
  }

  public get join(): Flag.Joiner<T> {
    return this._join;
  }

  public matches(name: string): boolean {
    name = name.length === 1 ? name.replace(/^-/, "") : name.replace(/^--/, "");

    return (
      this._name === name ||
      this._options.aliases.some((alias) => alias === name)
    );
  }

  public map<U>(mapper: Mapper<T, U>): Flag<U> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        default: this._options.default.map(mapper),
      },
      Parser.map(this._parse, mapper),
      (_, next) => next
    );
  }

  public filter<U extends T>(
    predicate: Predicate<T, U>,
    ifError: Thunk<string> = () => "incorrect value"
  ): Flag<U> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        default: this._options.default.filter(predicate),
      },
      Parser.filter(this._parse, predicate, ifError),
      (previous, next) => {
        const joined = this._join(previous, next);

        if (predicate(joined)) {
          return joined;
        }

        return next;
      }
    );
  }

  public type(type: string): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        type: Option.of(type),
      },
      this._parse,
      this._join
    );
  }

  public alias(alias: string): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        aliases: [...this._options.aliases, alias],
      },
      this._parse,
      this._join
    );
  }

  public optional(): Flag<Option<T>> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        optional: true,
        default: this._options.default
          .map(Option.of)
          .orElse(() => Option.of(None)),
      },
      Parser.map(this._parse, Option.of),
      (previous, next) =>
        next.map((next) =>
          previous.map((previous) => this._join(previous, next)).getOr(next)
        )
    );
  }

  public repeatable(): Flag<Array<T>> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        repeatable: true,
        default: this._options.default.map((value) => [value]),
      },
      Parser.map(this._parse, (value) => [value]),
      (previous, next) =>
        previous.map((previous) => [...previous, ...next]).getOr(next)
    );
  }

  public default(value: T): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        optional: true,
        default: Option.of(value),
      },
      this._parse,
      this._join
    );
  }

  public choices<U extends T>(...choices: Array<U>): Flag<U> {
    return this.filter(
      Predicate.equals(...choices),
      () =>
        `incorrect value, expected one of ${choices
          .map((choice) => `"${choice}"`)
          .join(", ")}`
    ).type(choices.join("|"));
  }

  public toJSON(): Flag.JSON {
    return {
      name: this._name,
      description: this._description,
      options: {
        ...this._options,
        type: this._options.type.getOr(null),
        default: this._options.default.map(Serializable.toJSON).getOr(null),
      },
    };
  }
}

/**
 * @internal
 */
export namespace Flag {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    options: {
      [key: string]: json.JSON;
      type: string | null;
      aliases: Array<string>;
      optional: boolean;
      repeatable: boolean;
      default: json.JSON | null;
    };
  }

  export type Parser<T> = parser.Parser<Array<string>, T, string>;

  export type Joiner<T> = (previous: Option<T>, next: T) => T;

  export interface Options<T> {
    type: Option<string>;
    aliases: Array<string>;
    optional: boolean;
    repeatable: boolean;
    default: Option<T>;
  }

  export function string(name: string, description: string): Flag<string> {
    return Flag.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      return Ok.of([argv.slice(1), value] as const);
    }).type("string");
  }

  export function number(name: string, description: string): Flag<number> {
    return Flag.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return Err.of(`${value} is not a number`);
      }

      return Ok.of([argv.slice(1), number] as const);
    }).type("number");
  }

  export function integer(name: string, description: string): Flag<number> {
    return Flag.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return Err.of(`${value} is not an integer`);
      }

      return Ok.of([argv.slice(1), number] as const);
    }).type("integer");
  }

  export function boolean(name: string, description: string): Flag<boolean> {
    return Flag.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Ok.of([argv, true] as const);
      }

      if (value !== "true" && value !== "false") {
        return Err.of(`incorrect value, expected one of "true", "false"`);
      }

      return Ok.of([argv.slice(1), value === "true"] as const);
    }).type("boolean");
  }

  export function help(description: string): Flag<Option<undefined>> {
    return Flag.of("help", description, (argv) =>
      Ok.of([argv, undefined] as const)
    ).optional();
  }
}
