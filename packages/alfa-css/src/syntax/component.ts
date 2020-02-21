import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Block } from "./block";
import { Token } from "./token";

/**
 * @see https://drafts.csswg.org/css-syntax/#component-value
 */
export type Component = Array<Token>;

export namespace Component {
  /**
   * @see https://drafts.csswg.org/css-syntax/#consume-a-component-value
   */
  export const consume: Parser<Slice<Token>, Component> = input => {
    const next = input.get(0).get();

    const component = [next];

    if (
      Token.isOpenParenthesis(next) ||
      Token.isOpenSquareBracket(next) ||
      Token.isOpenCurlyBracket(next)
    ) {
      const [remainder, block] = Block.consume(input).get();

      input = remainder;
      component.push(...block.value);
    } else {
      input = input.slice(1);
    }

    return Ok.of([input, component] as const);
  };

  /**
   * @see https://drafts.csswg.org/css-syntax/#parse-component-value
   */
  export const parse: Parser<Slice<Token>, Component, string> = input => {
    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    if (input.length === 0) {
      return Err.of("Unexpected end of input");
    }

    const component = consume(input);

    while (input.get(0).some(Token.isWhitespace)) {
      input = input.slice(1);
    }

    if (input.length !== 0) {
      return Err.of("Expected end of input");
    }

    return component;
  };
}
