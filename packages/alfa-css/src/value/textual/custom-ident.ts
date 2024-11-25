import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { String } from "@siteimprove/alfa-string";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import type { Resolvable } from "../resolvable.js";
import { Ident } from "./ident.js";

const { map } = Parser;

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
    predicate: Predicate<string> = () => true,
  ): CSSParser<CustomIdent> {
    return map(
      Token.parseIdent(
        (ident) =>
          !illegalCustomIdents.includes(String.toLowerCase(ident.value)) &&
          predicate(ident.value),
      ),
      (ident) => CustomIdent.of(ident.value),
    );
  }
}
