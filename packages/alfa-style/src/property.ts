import { Token, Keyword } from "@siteimprove/alfa-css";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Slice } from "@siteimprove/alfa-slice";
import { Parser } from "@siteimprove/alfa-parser";

import * as parser from "@siteimprove/alfa-parser";

import { Style } from "./style";
import { Value } from "./value";

const { left, either, end } = Parser;

const parseDefaults = Keyword.parse("initial", "inherit", "unset");

/**
 * @internal
 */
export class Property<SPECIFIED = unknown, COMPUTED = SPECIFIED> {
  public static of<SPECIFIED, COMPUTED>(
    initial: COMPUTED,
    parse: Property.Parser<SPECIFIED>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Property.Options = {
      inherits: false,
    }
  ): Property<SPECIFIED, COMPUTED> {
    return new Property(
      initial,
      left(
        either(parseDefaults, parse),
        end(() => "Expected end of input")
      ),
      compute,
      options
    );
  }

  public static extend<SPECIFIED, COMPUTED>(
    property: Property<SPECIFIED, COMPUTED>,
    overrides: {
      initial?: COMPUTED;
      parse?: Property.Parser<SPECIFIED>;
      compute?: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>;
      options?: Property.Options;
    } = {}
  ): Property<SPECIFIED, COMPUTED> {
    const {
      initial = property._initial,
      parse,
      compute = property._compute,
      options = {},
    } = overrides;

    return new Property(
      initial,
      parse === undefined
        ? property._parse
        : left(
            either(parseDefaults, parse),
            end(() => "Expected end of input")
          ),
      compute,
      {
        ...property._options,
        ...options,
      }
    );
  }

  private readonly _initial: COMPUTED;
  private readonly _parse: Property.Parser<SPECIFIED>;
  private readonly _compute: Mapper<
    Value<SPECIFIED>,
    Value<COMPUTED>,
    [style: Style]
  >;
  private readonly _options: Property.Options;

  private constructor(
    initial: COMPUTED,
    parse: Property.Parser<SPECIFIED>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Property.Options
  ) {
    this._initial = initial;
    this._parse = parse;
    this._compute = compute;
    this._options = options;
  }

  get initial(): COMPUTED {
    return this._initial;
  }

  get parse(): Property.Parser<SPECIFIED> {
    return this._parse;
  }

  get compute(): Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]> {
    return this._compute;
  }

  get options(): Property.Options {
    return this._options;
  }
}

/**
 * @internal
 */
export namespace Property {
  export interface Options {
    readonly inherits: boolean;
  }

  export type Parser<SPECIFIED = Value.Parsed> = parser.Parser<
    Slice<Token>,
    Value.Default | SPECIFIED,
    string
  >;

  export namespace Value {
    /**
     * The default keywords recognised by all properties.
     */
    export type Default =
      | Keyword<"initial">
      | Keyword<"inherit">
      | Keyword<"unset">;

    /**
     * Extract the parsed type of a named property.
     *
     * @remarks
     * The parsed type differs from the declared type in that the parsed type
     * must not include the defaulting keywords as these are handled globally
     * rather than individually.
     */
    export type Parsed<N extends Name = Name> = WithName<N> extends Property<
      infer SPECIFIED,
      infer COMPUTED
    >
      ? SPECIFIED
      : never;

    /**
     * Extract the declared type of a named property.
     *
     * {@link https://drafts.csswg.org/css-cascade/#declared}
     *
     * @remarks
     * The declared type includes the parsed type in addition to the defaulting
     * keywords recognised by all properties.
     */
    export type Declared<N extends Name> = Parsed<N> | Default;

    /**
     * Extract the cascaded type of a named property.
     *
     * {@link https://drafts.csswg.org/css-cascade/#cascaded}
     */
    export type Cascaded<N extends Name> = Declared<N>;

    /**
     * Extract the specified type of a named property.
     *
     * {@link https://drafts.csswg.org/css-cascade/#specified}
     */
    export type Specified<N extends Name> = Parsed<N> | Computed<N>;

    /**
     * Extract the computed type a named property.
     *
     * {@link https://drafts.csswg.org/css-cascade/#computed}
     */
    export type Computed<N extends Name> = WithName<N> extends Property<
      infer SPECIFIED,
      infer COMPUTED
    >
      ? COMPUTED
      : never;

    /**
     * Extract the initial type of a named property.
     */
    export type Initial<N extends Name> = Computed<N>;

    /**
     * Extract the inherited type of a named property.
     */
    export type Inherited<N extends Name> = Computed<N>;
  }

  export type Name = keyof Longhands;

  export type WithName<N extends Name> = Longhands[N];

  export const longhands = new Map<Name, Property>();

  export function register<N extends Name>(
    name: N,
    property: WithName<N>
  ): WithName<N> {
    longhands.set(name, property as Property);
    return property;
  }

  export function isName(name: string): name is Name {
    return longhands.has(name as Name);
  }

  export function get<N extends Name>(name: N): WithName<N> {
    return longhands.get(name) as WithName<N>;
  }

  export class Shorthand<N extends Name = never> {
    public static of<N extends Name>(
      properties: Array<N>,
      parse: Shorthand.Parser<N>
    ) {
      return new Shorthand(
        properties,
        left(
          either(parseDefaults, parse),
          end(() => "Expected end of input")
        )
      );
    }

    private readonly _properties: Array<N>;
    private readonly _parse: Shorthand.Parser<N>;

    private constructor(properties: Array<N>, parse: Shorthand.Parser<N>) {
      this._properties = properties;
      this._parse = parse;
    }

    public get properties(): Iterable<N> {
      return this._properties;
    }

    public get parse(): Shorthand.Parser<N> {
      return this._parse;
    }
  }

  export namespace Shorthand {
    export type Parser<N extends Property.Name = Property.Name> = parser.Parser<
      Slice<Token>,
      | Property.Value.Default
      | Iterable<{ [M in N]: readonly [M, Property.Value.Declared<M>] }[N]>,
      string
    >;

    export type Name = keyof Shorthands;

    export type WithName<N extends Name> = Shorthands[N];

    const shorthands = new Map<Name, Shorthand>();

    export function register<N extends Name>(
      name: N,
      property: WithName<N>
    ): WithName<N> {
      shorthands.set(name, property as Shorthand);
      return property;
    }

    export function isName(name: string): name is Name {
      return shorthands.has(name as Name);
    }

    export function get<N extends Name>(name: N): WithName<N> {
      return shorthands.get(name) as WithName<N>;
    }
  }

  export const { of: shorthand, register: registerShorthand } = Shorthand;
}

/**
 * @internal
 */
export interface Longhands {}

/**
 * @internal
 */
export interface Shorthands {}
