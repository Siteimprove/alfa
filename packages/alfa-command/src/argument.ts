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

export class Argument<T = unknown> implements Functor<T>, Serializable {
  public static of<T>(
    name: string,
    description: string,
    parse: Argument.Parser<T>
  ): Argument<T> {
    const options: Argument.Options = {
      default: None,
      optional: false,
      repeatable: false,
    };

    return new Argument(
      name,
      description.replace(/\s+/g, " ").trim(),
      options,
      parse
    );
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _options: Argument.Options;
  private readonly _parse: Argument.Parser<T>;

  private constructor(
    name: string,
    description: string,
    options: Argument.Options,
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

  public get options(): Argument.Options {
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

  public filter<U extends T>(
    predicate: Predicate<T, U>,
    ifError: Thunk<string> = () => "Incorrect value"
  ): Argument<U> {
    return new Argument(
      this._name,
      this._description,
      this._options,
      Parser.filter(this._parse, predicate, ifError)
    );
  }

  public optional(): Argument<Option<T>> {
    return new Argument(
      this._name,
      this._description,
      {
        ...this._options,
        optional: true,
      },
      Parser.option(this._parse)
    );
  }

  public repeatable(): Argument<Iterable<T>> {
    return new Argument(
      this._name,
      this._description,
      {
        ...this._options,
        repeatable: true,
      },
      Parser.oneOrMore(this._parse)
    );
  }

  public default(value: T, label: string = `${value}`): Argument<T> {
    label = label.replace(/\s+/g, " ").trim();

    return new Argument(
      this._name,
      this._description,
      {
        ...this._options,
        optional: true,
        default: label === "" ? None : Option.of(label),
      },
      this._parse
    );
  }

  public choices<U extends T>(...choices: Array<U>): Argument<U> {
    return this.filter(Predicate.equals(...choices));
  }

  public toJSON(): Argument.JSON {
    return {
      name: this._name,
      description: this._description,
      options: {
        ...this._options,
        default: this._options.default.map(Serializable.toJSON).getOr(null),
      },
    };
  }
}

export namespace Argument {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    options: {
      [key: string]: json.JSON;
      optional: boolean;
      repeatable: boolean;
      default: json.JSON | null;
    };
  }

  export type Parser<T> = parser.Parser<Array<string>, T, string>;

  export interface Options {
    default: Option<string>;
    optional: boolean;
    repeatable: boolean;
  }

  export function string(name: string, description: string): Argument<string> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("Missing value");
      }

      return Ok.of([argv.slice(1), value] as const);
    });
  }

  export function number(name: string, description: string): Argument<number> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("Missing value");
      }

      const number = Number(value);

      if (!Number.isFinite(number)) {
        return Err.of(`${value} is not a number`);
      }

      return Ok.of([argv.slice(1), number] as const);
    });
  }

  export function integer(name: string, description: string): Argument<number> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("Missing value");
      }

      const number = Number(value);

      if (!Number.isInteger(number)) {
        return Err.of(`${value} is not an integer`);
      }

      return Ok.of([argv.slice(1), number] as const);
    });
  }

  export function boolean(
    name: string,
    description: string
  ): Argument<boolean> {
    return Argument.of(name, description, (argv) => {
      const [value] = argv;

      if (value === undefined) {
        return Err.of("Missing value");
      }

      if (value !== "true" && value !== "false") {
        return Err.of(`Incorrect value, expected one of "true", "false"`);
      }

      return Ok.of([argv.slice(1), value === "true"] as const);
    });
  }
}
