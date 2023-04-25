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
    parse: Longhand.Parser<SPECIFIED>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Longhand.Options = {
      inherits: false,
    }
  ): Longhand<SPECIFIED, COMPUTED> {
    return new Longhand(
      initial,
      left(
        either(Longhand.parseDefaults, parse),
        end(() => "Expected end of input")
      ),
      compute,
      options
    );
  }

  public static extend<SPECIFIED, COMPUTED>(
    property: Longhand<SPECIFIED, COMPUTED>,
    overrides: {
      initial?: COMPUTED;
      parse?: Longhand.Parser<SPECIFIED>;
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
      parse === undefined
        ? property._parse
        : left(
            either(Longhand.parseDefaults, parse),
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
  private readonly _parse: Longhand.Parser<SPECIFIED>;
  private readonly _compute: Mapper<
    Value<SPECIFIED>,
    Value<COMPUTED>,
    [style: Style]
  >;
  private readonly _options: Longhand.Options;

  private constructor(
    initial: COMPUTED,
    parse: Longhand.Parser<SPECIFIED>,
    compute: Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]>,
    options: Longhand.Options
  ) {
    this._initial = initial;
    this._parse = parse;
    this._compute = compute;
    this._options = options;
  }

  get initial(): COMPUTED {
    return this._initial;
  }

  get parse(): Longhand.Parser<SPECIFIED> {
    return this._parse;
  }

  get compute(): Mapper<Value<SPECIFIED>, Value<COMPUTED>, [style: Style]> {
    return this._compute;
  }

  get options(): Longhand.Options {
    return this._options;
  }
}

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
   * The default keywords recognised by all properties.
   */
  export type Default =
    | Keyword<"initial">
    | Keyword<"inherit">
    | Keyword<"unset">;

  export const parseDefaults = Keyword.parse("initial", "inherit", "unset");
}
