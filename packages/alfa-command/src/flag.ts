import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Err } from "@siteimprove/alfa-result";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Thunk } from "@siteimprove/alfa-thunk";

import * as json from "@siteimprove/alfa-json";
import * as parser from "@siteimprove/alfa-parser";

export class Flag<T = unknown> implements Functor<T>, Serializable {
  public static of<T>(
    name: string,
    description: string,
    parse: Flag.Parser<T, [Predicate<string>]>
  ): Flag<T> {
    const options: Flag.Options = {
      type: None,
      aliases: [],
      optional: false,
      repeatable: false,
      negatable: false,
      default: None,
    };

    return new Flag(
      name,
      description.replace(/\s+/g, " ").trim(),
      options,
      parse
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Flag.Options;
  private readonly _parse: Flag.Parser<T, [Predicate<string>]>;

  private constructor(
    name: string,
    description: string,
    options: Flag.Options,
    parse: Flag.Parser<T, [Predicate<string>]>
  ) {
    this._name = name;
    this._description = description;
    this._options = options;
    this._parse = parse;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get options(): Flag.Options {
    return this._options;
  }

  public get parse(): Flag.Parser<T> {
    return (argv) => this._parse(argv, (name) => this.matches(name));
  }

  public matches(name: string): boolean {
    name = name.length === 2 ? name.replace(/^-/, "") : name.replace(/^--/, "");

    if (this._options.negatable) {
      name = name.replace(/^no-/, "");
    }

    return (
      this._name === name ||
      this._options.aliases.some((alias) => alias === name)
    );
  }

  public map<U>(mapper: Mapper<T, U>): Flag<U> {
    return new Flag(
      this._name,
      this._description,
      this._options,
      Parser.map(this._parse, (set) => set.map(mapper))
    );
  }

  public filter<U extends T>(
    refinement: Refinement<T, U>,
    ifError?: Thunk<string>
  ): Flag<U>;

  public filter(predicate: Predicate<T>, ifError?: Thunk<string>): Flag<T>;

  public filter(
    predicate: Predicate<T>,
    ifError: Thunk<string> = () => "Incorrect value"
  ): Flag<T> {
    const filter = (previous: Flag.Set<T>): Flag.Parser<T> => (argv) =>
      previous
        .parse(argv)
        .flatMap(([argv, set]) =>
          predicate(set.value)
            ? Result.of([
                argv,
                Flag.Set.of(set.value, (argv) => filter(set)(argv)),
              ])
            : Err.of(ifError())
        );

    const parse: Flag.Parser<T, [Predicate<string>]> = (argv, matches) =>
      this._parse(argv, matches).flatMap(([argv, set]) =>
        predicate(set.value)
          ? Result.of([
              argv,
              Flag.Set.of(set.value, (argv) => filter(set)(argv)),
            ])
          : Err.of(ifError())
      );

    return new Flag(this._name, this._description, this._options, parse);
  }

  public type(type: string): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        type: Option.of(type),
      },
      this._parse
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
      this._parse
    );
  }

  public default(value: T, label: string = `${value}`): Flag<T> {
    label = label.replace(/\s+/g, " ").trim();

    const options = {
      ...this._options,
      optional: true,
      default: label === "" ? None : Option.of(label),
    };

    const missing = (
      previous: Flag.Set<T>
    ): Flag.Parser<T, [Predicate<string>]> => (argv, matches) => {
      const [name] = argv;

      if (name === undefined || !matches(name)) {
        return Result.of([
          argv,
          Flag.Set.of(previous.value, (argv) =>
            missing(previous)(argv, matches)
          ),
        ]);
      }

      return previous
        .parse(argv)
        .map(([argv, set]) => [
          argv,
          Flag.Set.of(set.value, (argv) => missing(set)(argv, matches)),
        ]);
    };

    const parse: Flag.Parser<T, [Predicate<string>]> = (argv, matches) => {
      const [name] = argv;

      if (name === undefined || !matches(name)) {
        return Result.of([
          argv,
          Flag.Set.of(value, (argv) => parse(argv, matches)),
        ]);
      }

      return this._parse(argv, matches).map(([argv, set]) => [
        argv,
        Flag.Set.of(set.value, (argv) => missing(set)(argv, matches)),
      ]);
    };

    return new Flag(this._name, this._description, options, parse);
  }

  public optional(): Flag<Option<T>> {
    const options = { ...this._options, optional: true };

    const missing = (
      previous: Flag.Set<Option<T>>
    ): Flag.Parser<Option<T>, [Predicate<string>]> => (argv, matches) => {
      const [name] = argv;

      if (name === undefined || !matches(name)) {
        return Result.of([
          argv,
          Flag.Set.of(previous.value, (argv) =>
            missing(previous)(argv, matches)
          ),
        ]);
      }

      return previous
        .parse(argv)
        .map(([argv, set]) => [
          argv,
          Flag.Set.of(set.value, (argv) => missing(set)(argv, matches)),
        ]);
    };

    const parse: Flag.Parser<Option<T>, [Predicate<string>]> = (
      argv,
      matches
    ) => {
      const [name] = argv;

      if (name === undefined || !matches(name)) {
        return Result.of([
          argv,
          Flag.Set.of(Option.empty(), (argv) => parse(argv, matches)),
        ]);
      }

      return this._parse(argv, matches).map(([argv, set]) => [
        argv,
        Flag.Set.of(Option.of(set.value), (argv) =>
          missing(set.map(Option.of))(argv, matches)
        ),
      ]);
    };

    return new Flag(this._name, this._description, options, parse);
  }

  public repeatable(): Flag<Iterable<T>> {
    const options = { ...this._options, repeatable: true };

    const repeat = (previous: Flag.Set<Array<T>>): Flag.Parser<Array<T>> => (
      argv
    ) =>
      previous
        .parse(argv)
        .map(([argv, set]) => [
          argv,
          Flag.Set.of([...previous.value, ...set.value], (argv) =>
            repeat(set)(argv)
          ),
        ]);

    const parse: Flag.Parser<Array<T>, [Predicate<string>]> = (argv, matches) =>
      this._parse(argv, matches).map(([argv, set]) => [
        argv,
        Flag.Set.of([set.value], (argv) =>
          repeat(set.map((value) => [value]))(argv)
        ),
      ]);

    return new Flag(this._name, this._description, options, parse);
  }

  public negatable(mapper: Mapper<T>): Flag<T> {
    const options = { ...this._options, negatable: true };

    const negate = (
      previous: Flag.Set<T>
    ): Flag.Parser<T, [Predicate<string>]> => (argv, matches) => {
      const [name] = argv;

      const isNegated = name !== undefined && name.startsWith("--no-");

      if (isNegated) {
        argv = [name.replace("--no-", "--"), ...argv.slice(1)];
      }

      return previous
        .parse(argv)
        .map(([argv, set]) => [
          argv,
          Flag.Set.of(isNegated ? mapper(set.value) : set.value, (argv) =>
            negate(set)(argv, matches)
          ),
        ]);
    };

    const parse: Flag.Parser<T, [Predicate<string>]> = (argv, matches) => {
      const [name] = argv;

      const isNegated = name !== undefined && name.startsWith("--no-");

      if (isNegated) {
        argv = [name.replace("--no-", "--"), ...argv.slice(1)];
      }

      return this._parse(argv, matches).map(([argv, set]) => [
        argv,
        Flag.Set.of(isNegated ? mapper(set.value) : set.value, (argv) =>
          negate(set)(argv, matches)
        ),
      ]);
    };

    return new Flag(this._name, this._description, options, parse);
  }

  public choices<U extends T>(...choices: Array<U>): Flag<U> {
    return this.filter(
      Refinement.equals(...choices),
      () =>
        `Incorrect value, expected one of ${choices
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

export namespace Flag {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    options: {
      [key: string]: json.JSON;
      type: string | null;
      aliases: Array<string>;
      default: json.JSON | null;
      optional: boolean;
      repeatable: boolean;
    };
  }

  export type Parser<T, A extends Array<unknown> = []> = parser.Parser<
    Array<string>,
    Set<T>,
    string,
    A
  >;

  export interface Options {
    readonly type: Option<string>;
    readonly aliases: Array<string>;
    readonly default: Option<string>;
    readonly optional: boolean;
    readonly repeatable: boolean;
    readonly negatable: boolean;
  }

  /**
   * The `Set<T>` class, from the concept of "flag sets", acts as a container
   * for parsed flag values. As flags can be specified multiple times, this
   * class allows us to encapsulate the current value of a given flag and a
   * parser to parse another instance of the flag value and determine how to
   * combine the two.
   */
  export class Set<T> implements Functor<T> {
    public static of<T>(value: T, parse: Flag.Parser<T>) {
      return new Set(value, parse);
    }

    private readonly _value: T;
    private readonly _parse: Flag.Parser<T>;

    private constructor(value: T, parse: Flag.Parser<T>) {
      this._value = value;
      this._parse = parse;
    }

    public get value(): T {
      return this._value;
    }

    public get parse(): Flag.Parser<T> {
      return this._parse;
    }

    public map<U>(mapper: Mapper<T, U>): Set<U> {
      return new Set(mapper(this._value), (argv) =>
        this._parse(argv).map(([argv, set]) => [argv, set.map(mapper)])
      );
    }
  }

  export function string(name: string, description: string): Flag<string> {
    const parse: Flag.Parser<string, [Predicate<string>]> = (argv, matches) => {
      const [name, value] = argv;

      if (name === undefined || !matches(name)) {
        return Err.of("Missing flag");
      }

      if (value === undefined) {
        return Err.of("Missing value");
      }

      return Result.of([
        argv.slice(2),
        Flag.Set.of(value, (argv) => parse(argv, matches)),
      ]);
    };

    return Flag.of(name, description, parse).type("string");
  }

  export function number(name: string, description: string): Flag<number> {
    const parse: Flag.Parser<number, [Predicate<string>]> = (argv, matches) => {
      const [name, value] = argv;

      if (name === undefined || !matches(name)) {
        return Err.of("Missing flag");
      }

      if (value === undefined) {
        return Err.of("Missing value");
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return Err.of(`${value} is not a number`);
      }

      return Result.of([
        argv.slice(2),
        Flag.Set.of(number, (argv) => parse(argv, matches)),
      ]);
    };

    return Flag.of(name, description, parse).type("number");
  }

  export function integer(name: string, description: string): Flag<number> {
    const parse: Flag.Parser<number, [Predicate<string>]> = (argv, matches) => {
      const [name, value] = argv;

      if (name === undefined || !matches(name)) {
        return Err.of("Missing flag");
      }

      if (value === undefined) {
        return Err.of("Missing value");
      }

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return Err.of(`${value} is not an integer`);
      }

      return Result.of([
        argv.slice(2),
        Flag.Set.of(number, (argv) => parse(argv, matches)),
      ]);
    };

    return Flag.of(name, description, parse).type("integer");
  }

  export function boolean(name: string, description: string): Flag<boolean> {
    const parse: Flag.Parser<boolean, [Predicate<string>]> = (
      argv,
      matches
    ) => {
      const [name, value] = argv;

      if (name === undefined || !matches(name)) {
        return Err.of("Missing flag");
      }

      if (value === undefined || (value !== "true" && value !== "false")) {
        return Result.of([
          argv.slice(1),
          Flag.Set.of(true, (argv) => parse(argv, matches)),
        ]);
      }

      return Result.of([
        argv.slice(2),
        Flag.Set.of(value === "true", (argv) => parse(argv, matches)),
      ]);
    };

    return Flag.of(name, description, parse)
      .type("boolean")
      .negatable((value) => !value);
  }

  export function empty(name: string, description: string): Flag<void> {
    const parse: Flag.Parser<void, [Predicate<string>]> = (argv, matches) => {
      const [name] = argv;

      if (name === undefined || !matches(name)) {
        return Err.of("Missing flag");
      }

      return Result.of([
        argv.slice(1),
        Flag.Set.of(undefined, (argv) => parse(argv, matches)),
      ]);
    };

    return Flag.of(name, description, parse);
  }

  export const Help = Symbol("--help");

  export function help(description: string): Flag<Option<symbol>> {
    return empty("help", description)
      .map(() => Help)
      .optional();
  }

  export const Version = Symbol("--version");

  export function version(description: string): Flag<Option<symbol>> {
    return empty("version", description)
      .map(() => Version)
      .optional();
  }
}
