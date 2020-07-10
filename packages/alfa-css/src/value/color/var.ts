import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Number } from "../number";
import { Current } from "./current";
import { Hex } from "./hex";
import { HSL } from "./hsl";
import { Named } from "./named";
import { RGB } from "./rgb";
import { System } from "./system";

const { map } = Parser;

export class Var implements Equatable, Hashable, Serializable {
  public static of(
    customProperty: string,
    fallbackValue: Option<string> = None
  ): Var {
    return new Var(customProperty, fallbackValue);
  }

  private readonly _customProperty: string;
  private readonly _fallbackValue: Option<string>;

  private constructor(customProperty: string, fallbackValue: Option<string>) {
    this._customProperty = customProperty;
    this._fallbackValue = fallbackValue;
  }

  public get type(): "color" {
    return "color";
  }

  public get format(): "var" {
    return "var";
  }

  public get customProperty(): string {
    return this._customProperty;
  }

  public get fallbackValue(): Option<string> {
    return this._fallbackValue;
  }

  // Hack
  public get color(): "var" {
    return "var";
  }

  public get red(): Number {
    return Number.of(255);
  }

  public get green(): Number {
    return Number.of(255);
  }

  public get blue(): Number {
    return Number.of(255);
  }

  public get alpha(): Number {
    // The "transparent" color has an alpha of 0 as it's, well, transparent. All
    // other named colors are fully opaque and therefore have an alpha of 1.
    return Number.of(0);
  }
  // End hack

  public equals(value: unknown): value is this {
    return (
      value instanceof Var &&
      value._customProperty === this._customProperty &&
      value._fallbackValue.equals(this._fallbackValue)
    );
  }

  public hash(hash: Hash): void {
    Hash.writeString(hash, this._customProperty);
    if (this._fallbackValue.isSome()) {
      Hash.writeString(hash, this._fallbackValue.get());
    }
  }

  public toJSON(): Var.JSON {
    return {
      type: "color",
      format: "var",
      customProperty: this._customProperty,
      fallbackValue: this._fallbackValue.toJSON(),
    };
  }

  public toString(): string {
    return `var(${this._customProperty} ${
      this._fallbackValue.isSome() ? ", " + this._fallbackValue.get() : ""
    })`;
  }
}

export namespace Var {
  import right = Parser.right;
  import left = Parser.left;
  import separated = Parser.separated;
  import delimited = Parser.delimited;
  import option = Parser.option;
  import either = Parser.either;
  import not = Predicate.not;
  import zeroOrMore = Parser.zeroOrMore;

  export interface JSON {
    [key: string]: json.JSON;
    type: "color";
    format: "var";
    customProperty: string;
    fallbackValue: Option.JSON;
  }

  export function isVar(value: unknown): value is Var {
    return value instanceof Var;
  }

  const parseSpaceDelimited = <T>(parser: Parser<Slice<Token>, T, string>) =>
    delimited(option(Token.parseWhitespace), parser);

  const parseOneArg =
    // first component: --custom-property-name
    left(
      parseSpaceDelimited(
        Token.parseIdent((ident) => ident.value.startsWith("--"))
      ),
      Token.parseCloseParenthesis
    );

  const parseNonVarColor = either(
    Hex.parse,
    either(
      Named.parse,
      either(either(RGB.parse, HSL.parse), either(Current.parse, System.parse))
    )
  );

  // @TODO duplicated from token.ts but many of he helpers do not belong here anyway…
  function parseToken<T extends Token>(
    predicate: Predicate<Token, T>
  ): Parser<Slice<Token>, T, string> {
    return (input) =>
      input
        .get(0)
        .filter(predicate)
        .map((token) => Ok.of([input.slice(1), token] as const))
        .getOrElse(() => Err.of("Expected token"));
  }
  // @TODO end duplicated from token.ts

  const parseNonClosingParenthesis = parseToken(not(Token.isCloseParenthesis));

  const parseTwoArgs = left(
    // first component: custom property name, second: fallback value
    separated(
      // first component: --custom-property-name
      parseSpaceDelimited(
        Token.parseIdent((ident) => ident.value.startsWith("--"))
      ),
      parseSpaceDelimited(Token.parseComma),
      // second component: everything
      // @TODO fix me, this should be any <declaration-value>
      // @TODO this is currently BROKEN if there are nested parenthesis, including a var() in the fallback!
      // @see https://drafts.csswg.org/css-variables/#using-variables
      // @see https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value
      // Here, we return the string that was matched as it will be reparsed after substitution
      parseSpaceDelimited(
        map(zeroOrMore(parseNonClosingParenthesis), (tokens) =>
          [...tokens].map((token) => token.toString()).join()
        )
      )
    ),
    Token.parseCloseParenthesis
  );

  export const parse = map(
    // function name + the rest, drop the function name.
    right(
      Token.parseFunction((fn) => fn.value === "var"),
      either(parseOneArg, parseTwoArgs)
    ),
    (result) =>
      Token.isIdent(result)
        ? Var.of(result.value, None)
        : Var.of(result[0].value, Some.of(result[1]))
  );
}
