import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

const { fromCharCode } = String;
const { and } = Predicate;

export type Token =
  | Token.Ident
  | Token.Function
  | Token.AtKeyword
  | Token.Hash
  | Token.String
  | Token.URL
  | Token.BadURL
  | Token.Delim
  | Token.Number
  | Token.Percentage
  | Token.Dimension
  | Token.Whitespace
  | Token.Colon
  | Token.Comma
  | Token.OpenParenthesis
  | Token.CloseParenthesis
  | Token.OpenSquareBracket
  | Token.CloseSquareBracket
  | Token.OpenCurlyBracket
  | Token.CloseCurlyBracket
  | Token.OpenComment
  | Token.CloseComment;

export namespace Token {
  abstract class Token {}

  function parseToken<T extends Token>(
    predicate: Predicate<Token, T>
  ): Parser<Slice<Token>, T, string> {
    return input =>
      input
        .get(0)
        .filter(predicate)
        .map(token => Ok.of([input.slice(1), token] as const))
        .getOrElse(() => Err.of("Expected token"));
  }

  export class Ident extends Token {
    public static of(value: string): Ident {
      return new Ident(value);
    }

    public readonly value: string;

    private constructor(value: string) {
      super();
      this.value = value;
    }

    public toString(): string {
      return this.value;
    }
  }

  export function isIdent(value: unknown): value is Ident {
    return value instanceof Ident;
  }

  export namespace Ident {
    export const parse = (query: string | Predicate<Ident> = () => true) => {
      let predicate: Predicate<Ident>;

      if (typeof query === "function") {
        predicate = query;
      } else {
        const value = query;

        predicate = ident => ident.value === value;
      }

      return parseToken(and(isIdent, predicate));
    };
  }

  export class Function extends Token {
    public static of(value: string): Function {
      return new Function(value);
    }

    public readonly value: string;

    private constructor(value: string) {
      super();
      this.value = value;
    }

    public toString(): string {
      return `${this.value}(`;
    }
  }

  export class AtKeyword extends Token {
    public static of(value: string): AtKeyword {
      return new AtKeyword(value);
    }

    public readonly value: string;

    private constructor(value: string) {
      super();
      this.value = value;
    }

    public toString(): string {
      return `@${this.value}`;
    }
  }

  export class Hash extends Token {
    public static of(value: string, isIdentifier: boolean): Hash {
      return new Hash(value, isIdentifier);
    }

    public readonly value: string;
    public readonly isIdentifier: boolean;

    private constructor(value: string, isIdentifier: boolean) {
      super();
      this.value = value;
      this.isIdentifier = isIdentifier;
    }

    public toString(): string {
      return `#${this.value}`;
    }
  }

  export function isHash(value: unknown): value is Hash {
    return value instanceof Hash;
  }

  export namespace Hash {
    export const parse = (predicate: Predicate<Hash> = () => true) =>
      parseToken(and(isHash, predicate));
  }

  export class String extends Token {
    public static of(value: string): String {
      return new String(value);
    }

    public readonly value: string;

    private constructor(value: string) {
      super();
      this.value = value;
    }

    public toString(): string {
      return `"${this.value.replace(/"/g, `\\"`)}"`;
    }
  }

  export function isString(value: unknown): value is String {
    return value instanceof String;
  }

  export namespace String {
    export const parse = (predicate: Predicate<String> = () => true) =>
      parseToken(and(isString, predicate));
  }

  export class URL extends Token {
    public static of(value: string): URL {
      return new URL(value);
    }

    public readonly value: string;

    private constructor(value: string) {
      super();
      this.value = value;
    }

    public toString(): string {
      return `url(${this.value})`;
    }
  }

  export function isURL(value: unknown): value is URL {
    return value instanceof URL;
  }

  export namespace URL {
    export const parse = (predicate: Predicate<URL>) =>
      parseToken(and(isURL, predicate));
  }

  export class BadURL extends Token {
    public static of(): BadURL {
      return new BadURL();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "";
    }
  }

  export class Delim extends Token {
    public static of(value: number): Delim {
      return new Delim(value);
    }

    public readonly value: number;

    private constructor(value: number) {
      super();
      this.value = value;
    }

    public toString(): string {
      return fromCharCode(this.value);
    }
  }

  export function isDelim(value: unknown): value is Delim {
    return value instanceof Delim;
  }

  export namespace Delim {
    export const parse = (
      query: string | number | Predicate<Delim> = () => true
    ) => {
      let predicate: Predicate<Delim>;

      if (typeof query === "function") {
        predicate = query;
      } else {
        const value = typeof query === "number" ? query : query.charCodeAt(0);

        predicate = delim => delim.value === value;
      }

      return parseToken(and(isDelim, predicate));
    };
  }

  export class Number extends Token {
    public static of(
      value: number,
      isInteger: boolean,
      isSigned: boolean
    ): Number {
      return new Number(value, isInteger, isSigned);
    }

    readonly value: number;
    readonly isInteger: boolean;
    readonly isSigned: boolean;

    private constructor(value: number, isInteger: boolean, isSigned: boolean) {
      super();
      this.value = value;
      this.isInteger = isInteger;
      this.isSigned = isSigned;
    }

    public toString(): string {
      return this.value.toString(10);
    }
  }

  export function isNumber(value: unknown): value is Token {
    return value instanceof Number;
  }

  export namespace Number {
    export const parse = (predicate: Predicate<Number> = () => true) =>
      parseToken(and(isNumber, predicate));
  }

  export class Percentage extends Token {
    public static of(value: number, isInteger: boolean): Percentage {
      return new Percentage(value, isInteger);
    }

    public readonly value: number;
    public readonly isInteger: boolean;

    private constructor(value: number, isInteger: boolean) {
      super();
      this.value = value;
      this.isInteger = isInteger;
    }

    public toString(): string {
      return `${this.value.toString(10)}%`;
    }
  }

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Percentage;
  }

  export namespace Percentage {
    export const parse = (predicate: Predicate<Percentage> = () => true) =>
      parseToken(and(isPercentage, predicate));
  }

  export class Dimension extends Token {
    public static of(
      value: number,
      unit: string,
      isInteger: boolean,
      isSigned: boolean
    ): Dimension {
      return new Dimension(value, unit, isInteger, isSigned);
    }

    public readonly value: number;
    public readonly unit: string;
    public readonly isInteger: boolean;
    public readonly isSigned: boolean;

    private constructor(
      value: number,
      unit: string,
      isInteger: boolean,
      isSigned: boolean
    ) {
      super();
      this.value = value;
      this.unit = unit;
      this.isInteger = isInteger;
      this.isSigned = isSigned;
    }

    public toString(): string {
      return `${this.value.toString(10)}${this.unit}`;
    }
  }

  export class Whitespace extends Token {
    public static of(): Whitespace {
      return new Whitespace();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return " ";
    }
  }

  export function isWhitespace(value: unknown): value is Whitespace {
    return value instanceof Whitespace;
  }

  export namespace Whitespace {
    export const parse = parseToken(isWhitespace);
  }

  export class Colon extends Token {
    public static of(): Colon {
      return new Colon();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return ":";
    }
  }

  export class Semicolon extends Token {
    public static of(): Semicolon {
      return new Semicolon();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return ";";
    }
  }

  export class Comma extends Token {
    public static of(): Comma {
      return new Comma();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return ",";
    }
  }

  export function isComma(value: unknown): value is Comma {
    return value instanceof Comma;
  }

  export namespace Comma {
    export const parse = parseToken(isComma);
  }

  export class OpenParenthesis extends Token {
    public static of(): OpenParenthesis {
      return new OpenParenthesis();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "(";
    }
  }

  export class CloseParenthesis extends Token {
    public static of(): CloseParenthesis {
      return new CloseParenthesis();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return ")";
    }
  }

  export class OpenSquareBracket extends Token {
    public static of(): OpenSquareBracket {
      return new OpenSquareBracket();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "[";
    }
  }

  export function isOpenSquareBracket(
    value: unknown
  ): value is OpenSquareBracket {
    return value instanceof OpenSquareBracket;
  }

  export namespace OpenSquareBracket {
    export const parse = parseToken(isOpenSquareBracket);
  }

  export class CloseSquareBracket extends Token {
    public static of(): CloseSquareBracket {
      return new CloseSquareBracket();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "]";
    }
  }

  export function isCloseSquareBracket(
    value: unknown
  ): value is CloseSquareBracket {
    return value instanceof CloseSquareBracket;
  }

  export namespace CloseSquareBracket {
    export const parse = parseToken(isCloseSquareBracket);
  }

  export class OpenCurlyBracket extends Token {
    public static of(): OpenCurlyBracket {
      return new OpenCurlyBracket();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "{";
    }
  }

  export class CloseCurlyBracket extends Token {
    public static of(): CloseCurlyBracket {
      return new CloseCurlyBracket();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "}";
    }
  }

  export class OpenComment extends Token {
    public static of(): OpenComment {
      return new OpenComment();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "<!--";
    }
  }

  export class CloseComment extends Token {
    public static of(): CloseComment {
      return new CloseComment();
    }

    private constructor() {
      super();
    }

    public toString(): string {
      return "-->";
    }
  }
}
