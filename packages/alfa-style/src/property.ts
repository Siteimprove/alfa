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
    compute: Mapper<Style, Option<Value<U>>>,
    options: Property.Options = { inherits: false }
  ): Property<T, U> {
    return new Property(initial, parse, compute, options);
  }

  public readonly initial: U;
  public readonly parse: Parser<Slice<Token>, T, string>;
  public readonly compute: Mapper<Style, Option<Value<U>>>;
  public readonly options: Property.Options;

  private constructor(
    initial: U,
    parse: Parser<Slice<Token>, T, string>,
    compute: Mapper<Style, Option<Value<U>>>,
    options: Property.Options
  ) {
    this.initial = initial;
    this.parse = parse;
    this.compute = compute;
    this.options = options;
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
      ? Value<T> | Value<U>
      : never;

    export type Computed<P> = P extends Property<infer T, infer U>
      ? Value<U>
      : never;
  }
}

import display from "./property/display";
import opacity from "./property/opacity";
import transform from "./property/transform";
import visibility from "./property/visibility";

export namespace Property {
  export type Name = keyof Longhand;

  export type Longhand = typeof Longhand;
  export const Longhand = {
    display,
    opacity,
    transform,
    visibility
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
