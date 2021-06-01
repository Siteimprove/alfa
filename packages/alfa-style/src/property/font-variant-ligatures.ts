import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { List } from "./value/list";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "font-variant-ligatures": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | Keyword<"normal">
  | List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Common =
    | Keyword<"common-ligatures">
    | Keyword<"no-common-ligatures">;

  export type Discretionary =
    | Keyword<"discretionary-ligatures">
    | Keyword<"no-discretionary-ligatures">;

  export type Historical =
    | Keyword<"historical-ligatures">
    | Keyword<"no-historical-ligatures">;

  export type Contextual = Keyword<"contextual"> | Keyword<"no-contextual">;

  export type Item = Common | Discretionary | Historical | Contextual;
}
/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
const parseCommon = Keyword.parse("common-ligatures", "no-common-ligatures");

/**
 * @internal
 */
const parseDiscretionary = Keyword.parse(
  "discretionary-ligatures",
  "no-discretionary-ligatures"
);

/**
 * @internal
 */
const parseHistorical = Keyword.parse(
  "historical-ligatures",
  "no-historical-ligatures"
);

/**
 * @internal
 */
const parseContextual = Keyword.parse("contextual", "no-contextual");

/**
 * @internal
 */
const parseLigature: Parser<Slice<Token>, List<Specified.Item>, string> = (
  input
) => {
  let common: Specified.Common | undefined;
  let discretionary: Specified.Discretionary | undefined;
  let historical: Specified.Historical | undefined;
  let contextual: Specified.Contextual | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    if (common === undefined) {
      const result = parseCommon(input);

      if (result.isOk()) {
        [input, common] = result.get();
        continue;
      }
    }

    if (discretionary === undefined) {
      const result = parseDiscretionary(input);

      if (result.isOk()) {
        [input, discretionary] = result.get();
        continue;
      }
    }

    if (historical === undefined) {
      const result = parseHistorical(input);

      if (result.isOk()) {
        [input, historical] = result.get();
        continue;
      }
    }

    if (contextual === undefined) {
      const result = parseContextual(input);

      if (result.isOk()) {
        [input, contextual] = result.get();
        continue;
      }
    }

    break;
  }

  if (
    common === undefined &&
    discretionary === undefined &&
    historical === undefined &&
    contextual === undefined
  ) {
    return Err.of("At least one ligature value must be provided");
  }

  return Result.of([
    input,
    List.of(
      [common, discretionary, historical, contextual].filter(
        (value) => value !== undefined
        // filter doesn't narrow so we need to do it manually
      ) as Array<Specified.Item>,
      " "
    ),
  ]);
};

/**
 * @internal
 */
export const parse = either(Keyword.parse("none", "normal"), parseLigature);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-ligatures}
 * @internal
 */
export default Property.register(
  "font-variant-ligatures",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (ligatures) => ligatures,
    { inherits: true }
  )
);
