import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";

import { type Parser as CSSParser, Token } from "../syntax/index.js";

import type { Resolvable } from "./resolvable.js";
import { Ident } from "./ident.js";

const { map, parseIf } = Parser;
const { and } = Predicate;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident}
 *
 * @public
 */
export class CustomIdent
  extends Ident<"custom-ident">
  implements Resolvable<CustomIdent, never>
{
  public static of(value: string): CustomIdent {
    return new CustomIdent(value);
  }

  private constructor(value: string) {
    super("custom-ident", value);
  }

  public equals(value: unknown): value is this {
    return value instanceof CustomIdent && super.equals(value);
  }
}

/**
 * @public
 */
export namespace CustomIdent {
  export function isCustomIdent(value: unknown): value is CustomIdent {
    return value instanceof CustomIdent;
  }

  const illegalCustomIdents = ["initial", "inherit", "unset", "default"];

  export function parse(
    predicate: Predicate<CustomIdent> = () => true,
  ): CSSParser<CustomIdent> {
    return parseIf(
      and(
        isCustomIdent,
        (customIdent) =>
          !illegalCustomIdents.includes(customIdent.value.toLowerCase()),
        predicate,
      ),
      map(Token.parseIdent(), (ident) => CustomIdent.of(ident.value)),
      () => "Invalid custom-ident",
    );
  }
}
