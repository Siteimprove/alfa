import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { String } from "@siteimprove/alfa-string";

import { type Parser as CSSParser, Token } from "../../syntax/index.ts";

import type { Resolvable } from "../resolvable.ts";
import { Ident } from "./ident.ts";

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

  protected constructor(value: string) {
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
