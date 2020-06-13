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
export class Argument<T = unknown> implements Functor<T>, Serializable {
  public static of<T>(
    name: string,
    description: string,
    parse: Argument.Parser<T>
  ): Argument<T> {
    const options: Argument.Options = {
      optional: false,
      default: None,
    };

    return new Argument(
      name,
      description.replace(/\s+/g, " ").trim(),
      Record.of(options),
      parse
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Record<Argument.Options>;
  private readonly _parse: Argument.Parser<T>;

  private constructor(
    name: string,
    description: string,
    options: Record<Argument.Options>,
    parse: Argument.Parser<T>
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

  public get options(): Record<Argument.Options> {
    return this._options;
  }

  public get parse(): Argument.Parser<T> {
    return this._parse;
  }

  public map<U>(mapper: Mapper<T, U>): Argument<U> {
    return new Argument(
      this._name,
      this._description,
      this._options,
      Parser.map(this._parse, mapper)
    );
  }

  public optional(): Argument<Option<T>> {
    return new Argument(
      this._name,
      this._description,
      this._options.set("optional", true),
      (argv) => {
        const result = this._parse(argv).map(
          ([argv, result]) => [argv, Option.of(result)] as const
        );

        if (result.isErr() && result.getErr() === Argument.Error.NotSpecified) {
          return Ok.of([argv, None] as const);
        }

        return result;
      }
    );
  }

  public default(value: T): Argument<T> {
    return new Argument(
      this._name,
      this._description,
      this._options.set("default", Option.of(value)).set("optional", true),
      (argv) => {
        const result = this._parse(argv);

        if (result.isErr() && result.getErr() === Argument.Error.NotSpecified) {
          return Ok.of([argv, value] as const);
        }

        return result;
      }
    );
  }

  public toJSON(): Argument.JSON {
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
export namespace Argument {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    options: Record.JSON;
  }

  export type Parser<T> = parser.Parser<Array<string>, T, Error>;

  export enum Error {
    NotSpecified,
    InvalidValue,
  }

  export interface Options {
    optional: boolean;
    default: Option<unknown>;
  }

  export function string(name: string, description: string): Argument<string> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of(Error.NotSpecified);
      }

      return Ok.of([argv.slice(1), value] as const);
    });
  }

  export function number(name: string, description: string): Argument<number> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of(Error.NotSpecified);
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return Err.of(Error.InvalidValue);
      }

      return Ok.of([argv.slice(1), number] as const);
    });
  }
}
