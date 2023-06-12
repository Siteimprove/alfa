import { Keyword, Token } from "@siteimprove/alfa-css";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Slice } from "@siteimprove/alfa-slice";

import * as parser from "@siteimprove/alfa-parser";

import type { Style } from "./style";
import type { Value } from "./value";

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
    options: Longhand.Options = {
      inherits: false,
    }
  ): Longhand<SPECIFIED, COMPUTED> {
    return new Longhand(initial, parse, compute, options);
  }

  public static extend<SPECIFIED, COMPUTED>(
    property: Longhand<SPECIFIED, COMPUTED>,
    overrides: {
      initial?: COMPUTED;
      parse?: parser.Parser<Slice<Token>, SPECIFIED, string>;
      compute?: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>;
      options?: Longhand.Options;
    } = {}
  ): Longhand<SPECIFIED, COMPUTED> {
    const {
      initial = property._initial,
      parse,
      compute = property._compute,
      options = {},
    } = overrides;

    return new Longhand(
      initial,
      parse === undefined ? property._parseBase : parse,
      compute,
      {
        ...property._options,
        ...options,
      }
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
  private readonly _options: Longhand.Options;

  private constructor(
    initial: COMPUTED,
    parseBase: parser.Parser<Slice<Token>, SPECIFIED, string>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Longhand.Options
  ) {
    this._initial = initial;
    this._parseBase = parseBase;
    this._parse = left(
      either(Longhand.parseDefaults, parseBase),
      end(() => "Expected end of input")
    );
    this._compute = compute;
    this._options = options;
  }

  get initial(): COMPUTED {
    return this._initial;
  }

  get parse(): Longhand.Parser<SPECIFIED> {
    return this._parse;
  }

  /**
   * Return the base parser of the property, which does not parse the global
   * default values.
   *
   * @internal
   */
  get parseBase(): parser.Parser<Slice<Token>, SPECIFIED, string> {
    return this._parseBase;
  }

  get compute(): Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]> {
    return this._compute;
  }

  get options(): Longhand.Options {
    return this._options;
  }
}

/**
 * @internal
 */
export namespace Longhand {
  export interface Options {
    readonly inherits: boolean;
  }

  export type Parser<SPECIFIED> = parser.Parser<
    Slice<Token>,
    Default | SPECIFIED,
    string
  >;

  /**
   * Extract the parsed type of a property.
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
   */
  export type Parsed<T> = T extends Longhand<
    infer S,
    // Computed is only used in a covariant position in Longhand (as output of
    // compute). Therefore, it does not need to be inferred exactly.
    // C extends C' => Longhand<S, C> extends Longhand<S, C'>
    // Especially, Longhand<S, C> extends Longhand<S, unknown> for all C.
    unknown
  >
    ? S
    : never;

  /**
   * Extract the computed type a property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#computed}
   */
  export type Computed<T> = T extends Longhand<
    // Specified is used both in a covariant (output of the parser) and
    // contravariant (input of compute) position in Longhand. Therefore,
    // it needs to be exactly inferred for the subtyping to exist.
    infer S,
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
    | Keyword<"unset">;

  export const parseDefaults = Keyword.parse("initial", "inherit", "unset");

  /**
   * Utility function for longhands whose value can only be a list of keywords.
   *
   * @internal
   */
  export function fromKeywords<K extends string>(
    options: Options,
    initial: K,
    ...other: Array<K>
  ): Longhand<Keyword.ToKeywords<K>> {
    return Longhand.of<Keyword.ToKeywords<K>, Keyword.ToKeywords<K>>(
      Keyword.of(initial),
      Keyword.parse(initial, ...other),
      (value) => value,
      options
    );
  }
}
