import {
  Length,
  Number,
  Percentage,
  String,
  Token,
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Feature } from "./feature";
import { Orientation } from "./orientation";

const { delimited, either, map, mapResult, option, pair, right } = Parser;

// from and the parsers need to be extracted in order to avoid circular dependencies
// between the Feature class (and file) and its subclasses
export namespace Foo {
  type Features = {
    orientation: [Orientation.Value, Orientation];
  };

  export function from<K extends keyof Features>(
    name: K,
    value: Option<Features[K][0]>
  ): Result<Features[K][1], string>;

  export function from(name: string, value: Option<Feature.Value>): Err<string>;

  export function from(
    name: string,
    value: Option<Feature.Value>
  ): Result<Feature, string> {
    switch (name) {
      case "orientation":
        return Orientation.fromValue(value);
      default:
        return Err.of("Unknown feature");
    }
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-name
   */
  const parseName = map(Token.parseIdent(), (ident) =>
    ident.value.toLowerCase()
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-value
   */
  const parseValue = either(
    either(
      map(Token.parseNumber(), (number) => Number.of(number.value)),
      map(Token.parseIdent(), (ident) => String.of(ident.value.toLowerCase()))
    ),
    either(
      map(
        pair(
          Token.parseNumber((number) => number.isInteger),
          right(
            delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
            Token.parseNumber((number) => number.isInteger)
          )
        ),
        (result) => {
          const [left, right] = result;

          return Percentage.of(left.value / right.value);
        }
      ),
      Length.parse
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parsePlain: Parser<Slice<Token>, Feature, string> = mapResult(
    pair(
      parseName,
      right(
        delimited(option(Token.parseWhitespace), Token.parseColon),
        parseValue
      )
    ),
    (result) => {
      const [name, value] = result;

      return name === "orientation"
        ? from(name, Option.of(value))
        : (Ok.of(Feature.of(name, Option.of(value))) as Result<
            Feature,
            string
          >);
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseBoolean = map(parseName, (name) =>
    Feature.of<string, never>(name)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  export const parse = delimited(
    Token.parseOpenParenthesis,
    delimited(option(Token.parseWhitespace), either(parsePlain, parseBoolean)),
    Token.parseCloseParenthesis
  );
}
