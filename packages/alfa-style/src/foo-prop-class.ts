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
        either(Property.Value.parseDefaults, parse),
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
            either(Property.Value.parseDefaults, parse),
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

export namespace Property {
  export interface Options {
    readonly inherits: boolean;
  }

  export type Parser<SPECIFIED> = parser.Parser<
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

    export const parseDefaults = Keyword.parse("initial", "inherit", "unset");
  }
}
