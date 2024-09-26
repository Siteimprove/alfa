import type { Token } from "@siteimprove/alfa-css";
import { Keyword } from "@siteimprove/alfa-css";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Option } from "@siteimprove/alfa-option";
import type { Slice } from "@siteimprove/alfa-slice";

import * as parser from "@siteimprove/alfa-parser";

import type { Style } from "./style.js";
import type { Value } from "./value.js";

const { left, either, end } = parser.Parser;

/**
 * @internal
 *
 * @remarks
 * The parameter name SPECIFIED is somewhat ill-named. This type does not
 * contain the default keywords that are handled globally. The actual type of
 * specified values does include them.
 */
export class Longhand<SPECIFIED = unknown, COMPUTED = SPECIFIED> {
  public static of<SPECIFIED, COMPUTED>(
    initial: COMPUTED,
    parse: parser.Parser<Slice<Token>, SPECIFIED, string>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Partial<Longhand.Options<COMPUTED>> = {},
  ): Longhand<SPECIFIED, COMPUTED> {
    const { inherits = false, use = Option.of } = options;

    return new Longhand(initial, parse, compute, inherits, use);
  }

  public static extend<SPECIFIED, COMPUTED>(
    property: Longhand<SPECIFIED, COMPUTED>,
    overrides: {
      initial?: COMPUTED;
      parse?: parser.Parser<Slice<Token>, SPECIFIED, string>;
      compute?: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>;
      options?: Partial<Longhand.Options<COMPUTED>>;
    } = {},
  ): Longhand<SPECIFIED, COMPUTED> {
    const {
      initial = property._initial,
      parse = property._parseBase,
      compute = property._compute,
      options = {},
    } = overrides;

    return new Longhand(
      initial,
      parse,
      compute,
      options?.inherits ?? property._inherits,
      options?.use ?? property._use,
    );
  }

  private readonly _initial: COMPUTED;
  private readonly _parseBase: parser.Parser<Slice<Token>, SPECIFIED, string>;
  private readonly _parse: Longhand.Parser<SPECIFIED>;
  private readonly _compute: Mapper<
    Value<SPECIFIED>,
    Value<COMPUTED>,
    [style: Style]
  >;
  private readonly _inherits: boolean;
  private readonly _use: Mapper<
    Value<COMPUTED>,
    Option<Value<COMPUTED>>,
    [style: Style]
  >;

  private constructor(
    initial: COMPUTED,
    parseBase: parser.Parser<Slice<Token>, SPECIFIED, string>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    inherits: boolean,
    use: Mapper<Value<COMPUTED>, Option<Value<COMPUTED>>, [style: Style]>,
  ) {
    this._initial = initial;
    this._parseBase = parseBase;
    this._parse = left(
      either(Longhand.parseDefaults, parseBase),
      end(() => "Expected end of input"),
    );
    this._compute = compute;
    this._inherits = inherits;
    this._use = use;
  }

  get initial(): COMPUTED {
    return this._initial;
  }

  get parse(): Longhand.Parser<SPECIFIED> {
    return this._parse;
  }

  /**
   * Return the base parser of the property, which does not parse the global
   * default values. This is often useful when building parsers for shorthands.
   *
   * @internal
   */
  get parseBase(): parser.Parser<Slice<Token>, SPECIFIED, string> {
    return this._parseBase;
  }

  get compute(): Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]> {
    return this._compute;
  }

  get inherits(): boolean {
    return this._inherits;
  }

  get use(): Mapper<Value<COMPUTED>, Option<Value<COMPUTED>>, [style: Style]> {
    return this._use;
  }
}

/**
 * @internal
 */
export namespace Longhand {
  export interface Options<COMPUTED> {
    readonly inherits: boolean;
    readonly use: Mapper<
      Value<COMPUTED>,
      Option<Value<COMPUTED>>,
      [style: Style]
    >;
  }

  export type Parser<SPECIFIED> = parser.Parser<
    Slice<Token>,
    Default | SPECIFIED,
    string
  >;

  /**
   * Extracts the parsed type of a property.
   *
   * @remarks
   * The parsed type differs from the declared type in that the parsed type
   * must not include the defaulting keywords as these are handled globally
   * rather than individually.
   *
   * @remarks
   * The parsed type doesn't really exist in CSS. It is an artefact on how we
   * handle the default keywords. It is incorrectly called SPECIFIED in the
   * class definition.
   *
   * @remarks
   * This is a convenience type for building shorthands.
   *
   * @internal
   */
  export type Parsed<T> =
    T extends Longhand<
      infer S,
      // Computed is used both in a covariant (output of compute) and
      // contravariant (input of use) position in Longhand. Therefore,
      // it needs to be exactly inferred for the subtyping to exist.
      infer _
    >
      ? S
      : never;

  /**
   * Extracts the computed type of a property.
   *
   * @remarks
   * This is a convenience type for building shorthands.
   *
   * {@link https://drafts.csswg.org/css-cascade/#computed}
   *
   * @internal
   */
  export type Computed<T> =
    T extends Longhand<
      // Specified is used both in a covariant (output of the parser) and
      // contravariant (input of compute) position in Longhand. Therefore,
      //       // it needs to be exactly inferred for the subtyping to exist.
      infer _,
      infer C
    >
      ? C
      : never;

  /**
   * The default keywords recognised by all properties.
   */
  export type Default =
    | Keyword<"initial">
    | Keyword<"inherit">
    | Keyword<"revert">
    | Keyword<"unset">;

  export const parseDefaults = Keyword.parse(
    "initial",
    "inherit",
    "revert",
    "unset",
  );

  /**
   * Utility function for longhands whose value can only be a list of keywords.
   *
   * @internal
   */
  export function fromKeywords<K extends string>(
    options: Partial<Options<Keyword.ToKeywords<K>>>,
    initial: K,
    ...other: Array<K>
  ): Longhand<Keyword.ToKeywords<K>> {
    return Longhand.of<Keyword.ToKeywords<K>, Keyword.ToKeywords<K>>(
      Keyword.of(initial),
      Keyword.parse(initial, ...other),
      (value) => value,
      options,
    );
  }
}
