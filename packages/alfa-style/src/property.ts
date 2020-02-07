import { Token } from "@siteimprove/alfa-css";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Style } from "./style";
import { Value } from "./value";

export class Property<T = unknown, U = T> {
  public static of<T, U>(
    initial: U,
    parse: Parser<Slice<Token>, T, string>,
    compute: Mapper<Style, Value<U>>,
    options: Property.Options = { inherits: false }
  ): Property<T, U> {
    return new Property(initial, parse, compute, options);
  }

  private readonly _initial: U;
  private readonly _parse: Parser<Slice<Token>, T, string>;
  private readonly _compute: Mapper<Style, Value<U>>;
  private readonly _options: Property.Options;

  private constructor(
    initial: U,
    parse: Parser<Slice<Token>, T, string>,
    compute: Mapper<Style, Value<U>>,
    options: Property.Options
  ) {
    this._initial = initial;
    this._parse = parse;
    this._compute = compute;
    this._options = options;
  }

  get initial(): U {
    return this._initial;
  }

  get parse(): Parser<Slice<Token>, T, string> {
    return this._parse;
  }

  get compute(): Mapper<Style, Value<U>> {
    return this._compute;
  }

  get options(): Property.Options {
    return this._options;
  }
}

export namespace Property {
  export interface Options {
    readonly inherits: boolean;
  }

  export namespace Value {
    export type Parsed<P> = P extends Property<infer T, infer U>
      ? Value<T>
      : never;

    export type Initial<P> = P extends Property<infer T, infer U>
      ? Value<U>
      : never;

    export type Cascaded<P> = P extends Property<infer T, infer U>
      ? Value<T>
      : never;

    export type Specified<P> = P extends Property<infer T, infer U>
      ? Value<T | U>
      : never;

    export type Computed<P> = P extends Property<infer T, infer U>
      ? Value<U>
      : never;
  }
}

import { Display } from "./property/display";
import { Font } from "./property/font";
import { Opacity } from "./property/opacity";
import { Transform } from "./property/transform";
import { Visibility } from "./property/visibility";

export namespace Property {
  export type Name = keyof Longhand;

  export type Longhand = typeof Longhand;
  export const Longhand = {
    display: Display,
    "font-family": Font.Family,
    "font-size": Font.Size,
    "font-weight": Font.Weight,
    opacity: Opacity,
    transform: Transform,
    visibility: Visibility
  };

  export type Shorthand = typeof Shorthand;
  export const Shorthand = {};

  export function isLonghand(name: string): name is keyof Longhand {
    return name in Longhand;
  }

  export function isShorthand(name: string): name is keyof Shorthand {
    return name in Shorthand;
  }

  export function get<N extends keyof Longhand>(name: N): Longhand[N];
  export function get<N extends keyof Shorthand>(name: N): Shorthand[N];
  export function get(
    name: string
  ): Longhand[keyof Longhand] | Shorthand[keyof Shorthand] {
    if (isLonghand(name)) {
      return Longhand[name];
    }

    if (isShorthand(name)) {
      return Shorthand[name];
    }

    throw new Error(`${name} is not a property name`);
  }
}
