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

  export const parseIdent = (query: string | Predicate<Ident> = () => true) => {
    let predicate: Predicate<Ident>;

    if (typeof query === "function") {
      predicate = query;
    } else {
      const value = query;

      predicate = ident => ident.value === value;
    }

    return parseToken(and(isIdent, predicate));
  };

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

  export function isFunction(value: unknown): value is Function {
    return value instanceof Function;
  }

  export const parseFunction = (
    query: string | Predicate<Function> = () => true
  ) => {
    let predicate: Predicate<Function>;

    if (typeof query === "function") {
      predicate = query;
    } else {
      const value = query;

      predicate = ident => ident.value === value;
    }

    return parseToken(and(isFunction, predicate));
  };

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

  export const parseHash = (predicate: Predicate<Hash> = () => true) =>
    parseToken(and(isHash, predicate));

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

  export const parseString = (predicate: Predicate<String> = () => true) =>
    parseToken(and(isString, predicate));

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

  export const parseURL = (predicate: Predicate<URL> = () => true) =>
    parseToken(and(isURL, predicate));

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

  export const parseDelim = (
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
      return `${this.value}`;
    }
  }

  export function isNumber(value: unknown): value is Token {
    return value instanceof Number;
  }

  export const parseNumber = (predicate: Predicate<Number> = () => true) =>
    parseToken(and(isNumber, predicate));

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
      return `${this.value * 100}%`;
    }
  }

  export function isPercentage(value: unknown): value is Percentage {
    return value instanceof Percentage;
  }

  export const parsePercentage = (
    predicate: Predicate<Percentage> = () => true
  ) => parseToken(and(isPercentage, predicate));

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
      return `${this.value}${this.unit}`;
    }
  }

  export function isDimension(value: unknown): value is Dimension {
    return value instanceof Dimension;
  }

  export function parseDimension(predicate: Predicate<Dimension> = () => true) {
    return parseToken(and(isDimension, predicate));
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

  export const parseWhitespace = parseToken(isWhitespace);

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

  export const isColon: Predicate<unknown, Colon> = value =>
    value instanceof Colon;

  export const parseColon = parseToken(isColon);

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

  export const isSemicolon: Predicate<unknown, Semicolon> = value =>
    value instanceof Semicolon;

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

  export const isComma: Predicate<unknown, Comma> = value =>
    value instanceof Comma;

  export const parseComma = parseToken(isComma);

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

  export const isOpenParenthesis: Predicate<unknown, OpenParenthesis> = value =>
    value instanceof OpenParenthesis;

  export const parseOpenParenthesis = parseToken(isOpenParenthesis);

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

  export const isCloseParenthesis: Predicate<
    unknown,
    CloseParenthesis
  > = value => value instanceof CloseParenthesis;

  export const parseCloseParenthesis = parseToken(isCloseParenthesis);

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

  export const parseOpenSquareBracket = parseToken(isOpenSquareBracket);

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

  export const parseCloseSquareBracket = parseToken(isCloseSquareBracket);

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

  export const isOpenCurlyBracket: Predicate<
    unknown,
    OpenCurlyBracket
  > = value => value instanceof OpenCurlyBracket;

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

  export const isCloseCurlyBracket: Predicate<
    unknown,
    CloseCurlyBracket
  > = value => value instanceof CloseCurlyBracket;

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
