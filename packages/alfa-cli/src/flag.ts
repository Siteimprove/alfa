import { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Record } from "@siteimprove/alfa-record";
import { Ok, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";
import * as parser from "@siteimprove/alfa-parser";

/**
 * @internal
 */
export class Flag<T = unknown> implements Functor<T>, Serializable {
  public static of<T>(
    name: string,
    description: string,
    parse: (names: Array<string>) => Flag.Parser<T>
  ): Flag<T> {
    const options: Flag.Options = {
      type: None,
      aliases: [],
      optional: false,
      repeat: false,
      default: None,
    };

    return new Flag(
      name,
      description.replace(/\s+/g, " ").trim(),
      Record.of(options),
      parse
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Record<Flag.Options>;
  private readonly _parse: (names: Array<string>) => Flag.Parser<T>;

  private constructor(
    name: string,
    description: string,
    options: Record<Flag.Options>,
    parse: (names: Array<string>) => Flag.Parser<T>
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

  public get options(): Record<Flag.Options> {
    return this._options;
  }

  public get parse(): Flag.Parser<T> {
    return this._parse([this._name].concat(...this._options.get("aliases")));
  }

  public map<U>(mapper: Mapper<T, U>): Flag<U> {
    return new Flag(this._name, this._description, this._options, (names) =>
      Parser.map(this._parse(names), mapper)
    );
  }

  public type(type: string): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      this._options.set("type", Option.of(type)),
      this._parse
    );
  }

  public alias(alias: string): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      this._options.set("aliases", [
        ...this._options.get("aliases").get(),
        alias,
      ]),
      this._parse
    );
  }

  public optional(): Flag<Option<T>> {
    return new Flag(
      this._name,
      this._description,
      this._options.set("optional", true),
      (names) => (argv) => {
        const result = this._parse(names)(argv).map(
          ([argv, value]) => [argv, Option.of(value)] as const
        );

        if (result.isErr() && result.getErr() === Flag.Error.NotSpecified) {
          return Ok.of([argv, None] as const);
        }

        return result;
      }
    );
  }

  public repeat(): Flag<Iterable<T>> {
    return new Flag(
      this._name,
      this._description,
      this._options.set("repeat", true),
      (names) => (argv) => {
        const values: Array<T> = [];

        while (true) {
          const result = this._parse(names)(argv);

          if (result.isErr()) {
            if (result.getErr() === Flag.Error.NotSpecified) {
              break;
            } else {
              return result;
            }
          }

          const [remainder, value] = result.get();

          if (remainder.length === argv.length) {
            if (values.length === 0) {
              values.push(value);
            }

            break;
          }

          values.push(value);
          argv = remainder;
        }

        if (values.length === 0) {
          return Err.of(Flag.Error.NotSpecified);
        }

        return Ok.of([argv, values] as const);
      }
    );
  }

  public default(value: T): Flag<T> {
    return new Flag(
      this._name,
      this._description,
      this._options.set("default", Option.of(value)).set("optional", true),
      (names) => (argv) => {
        const result = this._parse(names)(argv);

        if (result.isErr() && result.getErr() === Flag.Error.NotSpecified) {
          return Ok.of([argv, value] as const);
        }

        return result;
      }
    );
  }

  public toJSON(): Flag.JSON {
    return {
      name: this._name,
      description: this._description,
      options: this._options.toJSON(),
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
    options: Record.JSON;
  }

  export type Parser<T> = parser.Parser<Array<string>, T, Error>;

  export enum Error {
    NotSpecified,
    MissingValue,
    InvalidValue,
  }

  export interface Options {
    type: Option<string>;
    aliases: Array<string>;
    optional: boolean;
    repeat: boolean;
    default: Option<unknown>;
  }

  export function string(name: string, description: string): Flag<string> {
    return Flag.of(name, description, (names) =>
      parse(names, (argv) => {
        const [value] = argv;

        if (value === undefined) {
          return Err.of(Error.MissingValue);
        }

        return Ok.of([argv.slice(1), value] as const);
      })
    ).type("string");
  }

  export function number(name: string, description: string): Flag<number> {
    return Flag.of(name, description, (names) =>
      parse(names, (argv) => {
        const [value] = argv;

        if (value === undefined) {
          return Err.of(Error.MissingValue);
        }

        const number = Number(value);

        if (!Number.isFinite(number)) {
          return Err.of(Error.InvalidValue);
        }

        return Ok.of([argv.slice(1), number] as const);
      })
    ).type("number");
  }

  export function integer(name: string, description: string): Flag<number> {
    return Flag.of(name, description, (names) =>
      parse(names, (argv) => {
        const [value] = argv;

        if (value === undefined) {
          return Err.of(Error.MissingValue);
        }

        const number = Number(value);

        if (!Number.isInteger(number)) {
          return Err.of(Error.InvalidValue);
        }

        return Ok.of([argv.slice(1), number] as const);
      })
    ).type("integer");
  }

  export function boolean(name: string, description: string): Flag<boolean> {
    return Flag.of(name, description, (names) =>
      parse(names, (argv) => {
        const [value] = argv;

        if (value === undefined) {
          return Ok.of([argv, true] as const);
        }

        if (value !== "true" && value !== "false") {
          return Err.of(Flag.Error.InvalidValue);
        }

        return Ok.of([argv.slice(1), value === "true"] as const);
      })
    ).type("boolean");
  }

  export function help(description: string): Flag<Option<void>> {
    return Flag.of("help", description, (names) =>
      parse(names, (argv) => Ok.of([argv, undefined] as const))
    ).optional();
  }
}

/**
 * Construct a flag parser that will parse a flag with one of several possible
 * names.
 *
 * @remarks
 * The parser works by first looking through the argument list for the name of
 * the flag to parse, prefixed with either `-` for single-letter names or `--`
 * otherwise. Once found, the parser grabs all arguments up until the next flag
 * begins as indicated by a `-` prefix. The arguments found are then passed to
 * the supplied parser which is tasked with determining the value, if any, of
 * the flag. The remaining arguments not consumed by the supplied parser are put
 * back into the argument list.
 */
function parse<T>(
  names: Array<string>,
  parser: Flag.Parser<T>
): Flag.Parser<T> {
  return (argv) => {
    const { length } = argv;

    for (const name of names) {
      const start = argv.indexOf(name.length === 1 ? `-${name}` : `--${name}`);

      if (start === -1) {
        continue;
      }

      const values: Array<string> = [];

      let end = start + 1;

      while (end < length) {
        const value = argv[end++];

        if (value.startsWith("-")) {
          break;
        }

        values.push(value);
      }

      const result = parser(values);

      if (result.isErr()) {
        return result;
      }

      const [remainder, value] = result.get();

      argv = argv.slice(0, start).concat(remainder).concat(argv.slice(end));

      return Ok.of([argv, value] as const);
    }

    return Err.of(Flag.Error.NotSpecified);
  };
}
