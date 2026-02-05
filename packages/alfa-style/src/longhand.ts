import type { Token } from "@siteimprove/alfa-css";
import { Keyword } from "@siteimprove/alfa-css";
import type { Mapper } from "@siteimprove/alfa-mapper";
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
export class Longhand<
  SPECIFIED = unknown,
  COMPUTED = SPECIFIED,
  USED = COMPUTED,
> {
  public static of<SPECIFIED, COMPUTED = SPECIFIED, USED = COMPUTED>(
    initial: COMPUTED,
    parse: parser.Parser<Slice<Token>, SPECIFIED, string>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Partial<Longhand.Options<COMPUTED, USED>> = {},
  ): Longhand<SPECIFIED, COMPUTED, USED> {
    const { inherits = false, use = (value) => value } = options;

    return new Longhand(
      initial,
      parse,
      compute,
      inherits,
      // If `use` is not provided, we default to `Option.of`. But in this case,
      // `USED` also has no value and default to `COMPUTED`, so the assertion is
      // OK. The only bad case would be forcing the type of `USED` with, e.g.
      // `const options: Options<string, number> = {}`.
      use as Mapper<Value<COMPUTED>, Value<USED>, [style: Style]>,
    );
  }

  public static extend<SPECIFIED, COMPUTED = SPECIFIED, USED = COMPUTED>(
    property: Longhand<SPECIFIED, COMPUTED, USED>,
    overrides: {
      initial?: COMPUTED;
      parse?: parser.Parser<Slice<Token>, SPECIFIED, string>;
      compute?: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>;
      inherits?: boolean;
      use?: Mapper<Value<COMPUTED>, Value<USED>, [style: Style]>;
    } = {},
  ): Longhand<SPECIFIED, COMPUTED, USED> {
    const {
      initial = property._initial,
      parse = property._parseBase,
      compute = property._compute,
      inherits = property._inherits,
      use = property._use,
    } = overrides;

    return new Longhand(initial, parse, compute, inherits, use);
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
  private readonly _use: Mapper<Value<COMPUTED>, Value<USED>, [style: Style]>;

  protected constructor(
    initial: COMPUTED,
    parseBase: parser.Parser<Slice<Token>, SPECIFIED, string>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    inherits: boolean,
    use: Mapper<Value<COMPUTED>, Value<USED>, [style: Style]>,
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

  get use(): Mapper<Value<COMPUTED>, Value<USED>, [style: Style]> {
    return this._use;
  }
}

/**
 * @internal
 */
export namespace Longhand {
  export interface Options<COMPUTED, USED = COMPUTED> {
    readonly inherits: boolean;
    readonly use: Mapper<Value<COMPUTED>, Value<USED>, [style: Style]>;
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
      infer _C,
      // Used is only used covariantly (output of use) in Longhand. But,
      // at this point, it's just simpler to exactly infer it as well.
      infer _U
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
      // it needs to be exactly inferred for the subtyping to exist.
      infer _S,
      infer C,
      // Used is only used covariantly (output of use) in Longhand. But,
      // at this point, it's just simpler to exactly infer it as well.
      infer _U
    >
      ? C
      : never;

  /**
   * Extracts the used type of a property.
   *
   * @remarks
   * This is a convenience type for building shorthands.
   *
   * {@link https://drafts.csswg.org/css-cascade/#used}
   *
   * @internal
   */
  export type Used<T> =
    T extends Longhand<
      // Specified is used both in a covariant (output of the parser) and
      // contravariant (input of compute) position in Longhand. Therefore,
      // it needs to be exactly inferred for the subtyping to exist.
      infer _S,
      // Computed is used both in a covariant (output of compute) and
      // contravariant (input of use) position in Longhand. Therefore,
      // it needs to be exactly inferred for the subtyping to exist.
      infer _C,
      infer U
    >
      ? U
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
  export function fromKeywords<K extends string, USED = Keyword.ToKeywords<K>>(
    options: Partial<Options<Keyword.ToKeywords<K>, USED>>,
    initial: K,
    ...other: Array<K>
  ): Longhand<Keyword.ToKeywords<K>, Keyword.ToKeywords<K>, USED> {
    return Longhand.of<Keyword.ToKeywords<K>, Keyword.ToKeywords<K>, USED>(
      Keyword.of(initial),
      Keyword.parse(initial, ...other),
      (value) => value,
      options,
    );
  }
}
