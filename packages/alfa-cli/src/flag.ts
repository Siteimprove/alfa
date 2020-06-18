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
      parse
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Flag.Options<T>;
  private readonly _parse: Flag.Parser<T>;

  private constructor(
    name: string,
    description: string,
    options: Flag.Options<T>,
    parse: Flag.Parser<T>
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

  public get options(): Flag.Options<T> {
    return this._options;
  }

  public get parse(): Flag.Parser<T> {
    return this._parse;
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
      Parser.map(this._parse, (set) => set.map(mapper))
    );
  }

  public filter<U extends T>(
    predicate: Predicate<T, U>,
    ifError: Thunk<string> = () => "incorrect value"
  ): Flag<U> {
    const parse: Flag.Parser<U> = (argv) => {
      const result = this._parse(argv);

      if (result.isErr()) {
        return result;
      }

      const [remainder, set] = result.get();

      if (predicate(set.value)) {
        return Ok.of([remainder, Flag.Set.of(set.value, () => parse)] as const);
      }

      return Err.of(ifError());
    };

    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        default: this._options.default.filter(predicate),
      },
      parse
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
      Parser.map(this._parse, (set) => set.map(Option.of))
    );
  }

  public repeatable(): Flag<Iterable<T>> {
    const parse = (set: Flag.Set<Array<T>>): Flag.Parser<Array<T>> => (
      argv
    ) => {
      const result = this._parse(argv);

      if (result.isErr()) {
        return result;
      }

      const [remainder, { value }] = result.get();

      return Ok.of([
        remainder,
        Flag.Set.of([...set.value, value], parse),
      ] as const);
    };

    return new Flag(
      this._name,
      this._description,
      {
        ...this._options,
        repeatable: true,
        default: this._options.default.map((value) => [value]),
      },
      Parser.map(this._parse, (set) => Flag.Set.of([set.value], parse))
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
      this._parse
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

  export type Parser<T> = parser.Parser<Array<string>, Set<T>, string>;

  export interface Options<T> {
    readonly type: Option<string>;
    readonly aliases: Array<string>;
    readonly optional: boolean;
    readonly repeatable: boolean;
    readonly default: Option<T>;
  }

  /**
   * The `Set<T>` class, from the concept of "flag sets", acts as a container
   * for parsed flag values. As flags can be specified multiple times, this
   * class allows us to encapsulate the current value of a given flag and a
   * parser to parse another instance of the flag value and determine how to
   * combine the two.
   *
   * @remarks
   * Conceptually, it's difficult to avoid having flag sets be invariant with
   * respect to the type of the flag as we need some sort of function of the
   * type `T -> string[] -> `T` that will take an existing flag value, parse a
   * new one from the input, and combine the two to form the final value. As `T`
   * appears in both argument and return value position in such a function, this
   * makes `T` invariant. This class avoids that by _binding_ the first `T` to
   * the type of the current flag set such that we only ever store a function of
   * the type `string[] -> T`. This ensures that flag sets remain covariant with
   * respect to the type of the flag.
   */
  export class Set<T> implements Functor<T> {
    public static of<T>(value: T, parse: (set: Set<T>) => Flag.Parser<T>) {
      return new Set(value, parse);
    }

    private readonly _value: T;
    private readonly _parse: Flag.Parser<T>;

    private constructor(value: T, parse: (set: Set<T>) => Flag.Parser<T>) {
      this._value = value;

      // Avoid `Set<T>` becoming invariant by binding the `T` appearing in the
      // argument list to the `T` of the current flag set.
      this._parse = parse(this);
    }

    public get value(): T {
      return this._value;
    }

    public get parse(): Flag.Parser<T> {
      return this._parse;
    }

    public map<U>(mapper: Mapper<T, U>): Set<U> {
      return new Set(mapper(this._value), () =>
        Parser.map(this._parse, (set) => set.map(mapper))
      );
    }
  }

  export function string(name: string, description: string): Flag<string> {
    const parse: Flag.Parser<string> = (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      return Ok.of([argv.slice(1), Flag.Set.of(value, () => parse)] as const);
    };

    return Flag.of(name, description, parse).type("string");
  }

  export function number(name: string, description: string): Flag<number> {
    const parse: Flag.Parser<number> = (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return Err.of(`${value} is not a number`);
      }

      return Ok.of([argv.slice(1), Flag.Set.of(number, () => parse)] as const);
    };

    return Flag.of(name, description, parse).type("number");
  }

  export function integer(name: string, description: string): Flag<number> {
    const parse: Flag.Parser<number> = (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("missing required value");
      }

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return Err.of(`${value} is not an integer`);
      }

      return Ok.of([argv.slice(1), Flag.Set.of(number, () => parse)] as const);
    };

    return Flag.of(name, description, parse).type("integer");
  }

  export function boolean(name: string, description: string): Flag<boolean> {
    const parse: Flag.Parser<boolean> = (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Ok.of([argv, Flag.Set.of(true, () => parse)] as const);
      }

      if (value !== "true" && value !== "false") {
        return Err.of(`incorrect value, expected one of "true", "false"`);
      }

      return Ok.of([
        argv.slice(1),
        Flag.Set.of(value === "true", () => parse),
      ] as const);
    };

    return Flag.of(name, description, parse).type("boolean");
  }

  export function empty(name: string, description: string): Flag<void> {
    const parse: Flag.Parser<void> = (argv) =>
      Ok.of([argv, Flag.Set.of(undefined, () => parse)] as const);

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
