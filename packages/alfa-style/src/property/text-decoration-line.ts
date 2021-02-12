import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";

import { Property } from "../property";

import { List } from "./value/list";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | List<
      | Keyword<"underline">
      | Keyword<"overline">
      | Keyword<"line-through">
      | Keyword<"blink">
    >;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), (input) => {
  const keywords: Array<
    | Keyword<"underline">
    | Keyword<"overline">
    | Keyword<"line-through">
    | Keyword<"blink">
  > = [];

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    const result = Keyword.parse(
      "underline",
      "overline",
      "line-through",
      "blink"
    )(input);

    if (result.isOk()) {
      const [remainder, value] = result.get();

      if (keywords.every((keyword) => !keyword.equals(value))) {
        keywords.push(value);
        input = remainder;
        continue;
      }
    }

    break;
  }

  if (keywords.length === 0) {
    return Err.of(
      `Expected one of underline, overline, line-through, or blink`
    );
  }

  return Result.of([input, List.of(keywords)]);
});

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-line
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (textDecorationLine) => textDecorationLine
);
