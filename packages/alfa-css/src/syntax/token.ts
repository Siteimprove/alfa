import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import type * as json from "@siteimprove/alfa-json";

import type { Parser as CSSParser } from "./parser.js";

const { map, oneOrMore, parseIf } = Parser;
const { fromCharCode } = String;
const { and } = Refinement;

/**
 * @public
 */
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
  | Token.Semicolon
  | Token.Comma
  | Token.OpenParenthesis
  | Token.CloseParenthesis
  | Token.OpenSquareBracket
  | Token.CloseSquareBracket
  | Token.OpenCurlyBracket
  | Token.CloseCurlyBracket
  | Token.OpenComment
  | Token.CloseComment;

/**
 * @public
 */
export namespace Token {
  export type JSON =
    | Ident.JSON
    | Function.JSON
    | AtKeyword.JSON
    | Hash.JSON
    | String.JSON
    | URL.JSON
    | BadURL.JSON
    | Delim.JSON
    | Number.JSON
    | Percentage.JSON
    | Dimension.JSON
    | Whitespace.JSON
    | Colon.JSON
    | Semicolon.JSON
    | Comma.JSON
    | OpenParenthesis.JSON
    | CloseParenthesis.JSON
    | OpenSquareBracket.JSON
    | CloseSquareBracket.JSON
    | OpenCurlyBracket.JSON
    | CloseCurlyBracket.JSON
    | OpenComment.JSON
    | CloseComment.JSON;

  const parseFirst: CSSParser<Token> = (input) =>
    input
      .first()
      .map((token) => Ok.of<[Slice<Token>, Token]>([input.rest(), token]))
      .getOr(Err.of("No token left"));

  function parseToken<T extends Token>(refinement: Refinement<Token, T>) {
    return parseIf(refinement, parseFirst, () => "Mismatching token");
  }

  export class Ident implements Equatable, Serializable<Ident.JSON> {
    public static of(value: string): Ident {
      return new Ident(value);
    }

    private readonly _value: string;

    protected constructor(value: string) {
      this._value = value;
    }

    public get type(): "ident" {
      return "ident";
    }

    public get value(): string {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof Ident && value._value === this._value;
    }

    public toJSON(): Ident.JSON {
      return {
        type: "ident",
        value: this._value,
      };
    }

    public toString(): string {
      return this._value;
    }
  }

  export namespace Ident {
    export interface JSON {
      [key: string]: json.JSON;
      type: "ident";
      value: string;
    }

    export function isIdent(value: unknown): value is Ident {
      return value instanceof Ident;
    }
  }

  export const { of: ident, isIdent } = Ident;

  export function parseIdent(query: string | Predicate<Ident> = () => true) {
    let predicate: Predicate<Ident>;

    if (typeof query === "function") {
      predicate = query;
    } else {
      const value = query;

      predicate = (ident) => ident.value === value;
    }

    return parseToken(and(isIdent, predicate));
  }

  export class Function implements Equatable, Serializable<Function.JSON> {
    public static of(value: string): Function {
      return new Function(value);
    }

    private readonly _value: string;

    protected constructor(value: string) {
      this._value = value;
    }

    public get type(): "function" {
      return "function";
    }

    public get value(): string {
      return this._value;
    }

    public get mirror(): CloseParenthesis {
      return CloseParenthesis.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof Function && value._value === this._value;
    }

    public toJSON(): Function.JSON {
      return {
        type: "function",
        value: this._value,
      };
    }

    public toString(): string {
      return `${this._value}(`;
    }
  }

  export namespace Function {
    export interface JSON {
      [key: string]: json.JSON;
      type: "function";
      value: string;
    }
    export function isFunction(value: unknown): value is Function {
      return value instanceof Function;
    }
  }

  export const { of: func, isFunction } = Function;

  export function parseFunction(
    query: string | Predicate<Function> = () => true,
  ) {
    const predicate: Predicate<Function> =
      typeof query === "function" ? query : (ident) => ident.value === query;

    return parseToken(and(isFunction, predicate));
  }

  export class AtKeyword implements Equatable, Serializable<AtKeyword.JSON> {
    public static of(value: string): AtKeyword {
      return new AtKeyword(value);
    }

    private readonly _value: string;

    protected constructor(value: string) {
      this._value = value;
    }

    public get type(): "at-keyword" {
      return "at-keyword";
    }

    public get value(): string {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof AtKeyword && value._value === this._value;
    }

    public toJSON(): AtKeyword.JSON {
      return {
        type: "at-keyword",
        value: this._value,
      };
    }

    public toString(): string {
      return `@${this._value}`;
    }
  }

  export namespace AtKeyword {
    export interface JSON {
      [key: string]: json.JSON;
      type: "at-keyword";
      value: string;
    }
  }

  export const { of: atKeyword } = AtKeyword;

  export class Hash implements Equatable, Serializable<Hash.JSON> {
    public static of(value: string, isIdentifier: boolean): Hash {
      return new Hash(value, isIdentifier);
    }

    private readonly _value: string;
    private readonly _isIdentifier: boolean;

    protected constructor(value: string, isIdentifier: boolean) {
      this._value = value;
      this._isIdentifier = isIdentifier;
    }

    public get type(): "hash" {
      return "hash";
    }

    public get value(): string {
      return this._value;
    }

    public get isIdentifier(): boolean {
      return this._isIdentifier;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Hash &&
        value._value === this._value &&
        value._isIdentifier === this._isIdentifier
      );
    }

    public toJSON(): Hash.JSON {
      return {
        type: "hash",
        value: this._value,
        isIdentifier: this._isIdentifier,
      };
    }

    public toString(): string {
      return `#${this._value}`;
    }
  }

  export namespace Hash {
    export interface JSON {
      [key: string]: json.JSON;
      type: "hash";
      value: string;
      isIdentifier: boolean;
    }

    export function isHash(value: unknown): value is Hash {
      return value instanceof Hash;
    }
  }

  export const { of: hash, isHash } = Hash;

  export function parseHash(predicate: Predicate<Hash> = () => true) {
    return parseToken(and(isHash, predicate));
  }

  export class String implements Equatable, Serializable<String.JSON> {
    public static of(value: string): String {
      return new String(value);
    }

    private readonly _value: string;

    protected constructor(value: string) {
      this._value = value;
    }

    public get type(): "string" {
      return "string";
    }

    public get value(): string {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof String && value._value === this._value;
    }

    public toJSON(): String.JSON {
      return {
        type: "string",
        value: this._value,
      };
    }

    public toString(): string {
      return `"${this._value.replace(/"/g, `\\"`)}"`;
    }
  }

  export namespace String {
    export interface JSON {
      [key: string]: json.JSON;
      type: "string";
      value: string;
    }

    export function isString(value: unknown): value is String {
      return value instanceof String;
    }
  }

  export const { of: string, isString } = String;

  export function parseString(predicate: Predicate<String> = () => true) {
    return parseToken(and(isString, predicate));
  }

  export class URL implements Equatable, Serializable<URL.JSON> {
    public static of(value: string): URL {
      return new URL(value);
    }

    private readonly _value: string;

    protected constructor(value: string) {
      this._value = value;
    }

    public get type(): "url" {
      return "url";
    }

    public get value(): string {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof URL && value._value === this._value;
    }

    public toJSON(): URL.JSON {
      return {
        type: "url",
        value: this._value,
      };
    }

    public toString(): string {
      return `url(${this._value})`;
    }
  }

  export namespace URL {
    export interface JSON {
      [key: string]: json.JSON;
      type: "url";
      value: string;
    }

    export function isURL(value: unknown): value is URL {
      return value instanceof URL;
    }
  }

  export const { of: url, isURL } = URL;

  export function parseURL(predicate: Predicate<URL> = () => true) {
    return parseToken(and(isURL, predicate));
  }

  export class BadURL implements Equatable, Serializable<BadURL.JSON> {
    private static _instance = new BadURL();

    public static of(): BadURL {
      return BadURL._instance;
    }

    private constructor() {}

    public get type(): "bad-url" {
      return "bad-url";
    }

    public equals(value: unknown): value is this {
      return value instanceof BadURL;
    }

    public toJSON(): BadURL.JSON {
      return {
        type: "bad-url",
      };
    }

    public toString(): string {
      return "";
    }
  }

  export namespace BadURL {
    export interface JSON {
      [key: string]: json.JSON;
      type: "bad-url";
    }
  }

  export const { of: badURL } = BadURL;

  export class Delim implements Equatable, Serializable<Delim.JSON> {
    private static _delims = new Map<number, Delim>();

    public static of(value: number): Delim {
      let delim = Delim._delims.get(value);

      if (delim === undefined) {
        delim = new Delim(value);
        Delim._delims.set(value, delim);
      }

      return delim;
    }

    private readonly _value: number;

    protected constructor(value: number) {
      this._value = value;
    }

    public get type(): "delim" {
      return "delim";
    }

    public get value(): number {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof Delim && value._value === this._value;
    }

    public toJSON(): Delim.JSON {
      return {
        type: "delim",
        value: this._value,
      };
    }

    public toString(): string {
      return fromCharCode(this._value);
    }
  }

  export namespace Delim {
    export interface JSON {
      [key: string]: json.JSON;
      type: "delim";
      value: number;
    }

    export function isDelim(value: unknown): value is Delim {
      return value instanceof Delim;
    }
  }

  export const { of: delim, isDelim } = Delim;

  export function parseDelim(
    query: string | number | Predicate<Delim> = () => true,
  ) {
    let predicate: Predicate<Delim>;

    if (typeof query === "function") {
      predicate = query;
    } else {
      const value = typeof query === "number" ? query : query.charCodeAt(0);

      predicate = (delim) => delim.value === value;
    }

    return parseToken(and(isDelim, predicate));
  }

  export class Number implements Equatable, Serializable<Number.JSON> {
    public static of(
      value: number,
      isInteger: boolean,
      isSigned: boolean,
    ): Number {
      return new Number(value, isInteger, isSigned);
    }

    private readonly _value: number;
    private readonly _isInteger: boolean;
    private readonly _isSigned: boolean;

    protected constructor(
      value: number,
      isInteger: boolean,
      isSigned: boolean,
    ) {
      this._value = value;
      this._isInteger = isInteger;
      this._isSigned = isSigned;
    }

    public get type(): "number" {
      return "number";
    }

    public get value(): number {
      return this._value;
    }

    public get isInteger(): boolean {
      return this._isInteger;
    }

    public get isSigned(): boolean {
      return this._isSigned;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Number &&
        value._value === this._value &&
        value._isInteger === this._isInteger &&
        value._isSigned === this._isSigned
      );
    }

    public toJSON(): Number.JSON {
      return {
        type: "number",
        value: this._value,
        isInteger: this._isInteger,
        isSigned: this._isSigned,
      };
    }

    public toString(): string {
      // If the token is explicitly signed and the value is positive, we must
      // add a `+` as this won't be included in the stringified value.
      const sign = this._isSigned && this._value >= 0 ? "+" : "";

      return `${sign}${this._value}`;
    }
  }

  export namespace Number {
    export interface JSON {
      [key: string]: json.JSON;
      type: "number";
      value: number;
      isInteger: boolean;
      isSigned: boolean;
    }

    export function isNumber(value: unknown): value is Number {
      return value instanceof Number;
    }
  }

  export const { of: number, isNumber } = Number;

  export function parseNumber(predicate: Predicate<Number> = () => true) {
    return parseToken(and(isNumber, predicate));
  }

  export class Percentage implements Equatable, Serializable<Percentage.JSON> {
    public static of(value: number, isInteger: boolean): Percentage {
      return new Percentage(value, isInteger);
    }

    private readonly _value: number;
    private readonly _isInteger: boolean;

    protected constructor(value: number, isInteger: boolean) {
      this._value = value;
      this._isInteger = isInteger;
    }

    public get type(): "percentage" {
      return "percentage";
    }

    public get value(): number {
      return this._value;
    }

    public get isInteger(): boolean {
      return this._isInteger;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Percentage &&
        value._value === this._value &&
        value._isInteger === this._isInteger
      );
    }

    public toJSON(): Percentage.JSON {
      return {
        type: "percentage",
        value: this._value,
        isInteger: this._isInteger,
      };
    }

    public toString(): string {
      return `${this._value * 100}%`;
    }
  }

  export namespace Percentage {
    export interface JSON {
      [key: string]: json.JSON;
      type: "percentage";
      value: number;
      isInteger: boolean;
    }

    export function isPercentage(value: unknown): value is Percentage {
      return value instanceof Percentage;
    }
  }

  export const { of: percentage, isPercentage } = Percentage;

  export function parsePercentage(
    predicate: Predicate<Percentage> = () => true,
  ) {
    return parseToken(and(isPercentage, predicate));
  }

  export class Dimension implements Equatable, Serializable<Dimension.JSON> {
    public static of(
      value: number,
      unit: string,
      isInteger: boolean,
      isSigned: boolean,
    ): Dimension {
      return new Dimension(value, unit, isInteger, isSigned);
    }

    private readonly _value: number;
    private readonly _unit: string;
    private readonly _isInteger: boolean;
    private readonly _isSigned: boolean;

    protected constructor(
      value: number,
      unit: string,
      isInteger: boolean,
      isSigned: boolean,
    ) {
      this._value = value;
      this._unit = unit;
      this._isInteger = isInteger;
      this._isSigned = isSigned;
    }

    public get type(): "dimension" {
      return "dimension";
    }

    public get value(): number {
      return this._value;
    }

    public get unit(): string {
      return this._unit;
    }

    public get isInteger(): boolean {
      return this._isInteger;
    }

    public get isSigned(): boolean {
      return this._isSigned;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Dimension &&
        value._value === this._value &&
        value._unit === this._unit &&
        value._isInteger === this._isInteger &&
        value._isSigned === this._isSigned
      );
    }

    public toJSON(): Dimension.JSON {
      return {
        type: "dimension",
        value: this._value,
        unit: this._unit,
        isInteger: this._isInteger,
        isSigned: this._isSigned,
      };
    }

    public toString(): string {
      // If the token is explicitly signed and the value is positive, we must
      // add a `+` as this won't be included in the stringified value.
      const sign = this._isSigned && this._value >= 0 ? "+" : "";

      return `${sign}${this._value}${this._unit}`;
    }
  }

  export namespace Dimension {
    export interface JSON {
      [key: string]: json.JSON;
      type: "dimension";
      value: number;
      unit: string;
      isInteger: boolean;
      isSigned: boolean;
    }

    export function isDimension(value: unknown): value is Dimension {
      return value instanceof Dimension;
    }
  }

  export const { of: dimension, isDimension } = Dimension;

  export function parseDimension(predicate: Predicate<Dimension> = () => true) {
    return parseToken(and(isDimension, predicate));
  }

  export class Whitespace implements Equatable, Serializable<Whitespace.JSON> {
    private static _instance = new Whitespace();

    public static of(): Whitespace {
      return Whitespace._instance;
    }

    private constructor() {}

    public get type(): "whitespace" {
      return "whitespace";
    }

    public equals(value: unknown): value is this {
      return value instanceof Whitespace;
    }

    public toJSON(): Whitespace.JSON {
      return {
        type: "whitespace",
      };
    }

    public toString(): string {
      return " ";
    }
  }

  export namespace Whitespace {
    export interface JSON {
      [key: string]: json.JSON;
      type: "whitespace";
    }

    export function isWhitespace(value: unknown): value is Whitespace {
      return value instanceof Whitespace;
    }
  }

  export const { of: whitespace, isWhitespace } = Whitespace;

  export const parseWhitespace = map(
    oneOrMore(parseToken(isWhitespace)),
    ([first]) => first,
  );

  export class Colon implements Equatable, Serializable<Colon.JSON> {
    private static _instance = new Colon();

    public static of(): Colon {
      return Colon._instance;
    }

    private constructor() {}

    public get type(): "colon" {
      return "colon";
    }

    public equals(value: unknown): value is this {
      return value instanceof Colon;
    }

    public toJSON(): Colon.JSON {
      return {
        type: "colon",
      };
    }

    public toString(): string {
      return ":";
    }
  }

  export namespace Colon {
    export interface JSON {
      [key: string]: json.JSON;
      type: "colon";
    }

    export function isColon(value: unknown): value is Colon {
      return value instanceof Colon;
    }
  }

  export const { of: colon, isColon } = Colon;

  export const parseColon = parseToken(isColon);

  export class Semicolon implements Equatable, Serializable<Semicolon.JSON> {
    private static _instance = new Semicolon();

    public static of(): Semicolon {
      return Semicolon._instance;
    }

    private constructor() {}

    public get type(): "semicolon" {
      return "semicolon";
    }

    public equals(value: unknown): value is this {
      return value instanceof Semicolon;
    }

    public toJSON(): Semicolon.JSON {
      return {
        type: "semicolon",
      };
    }

    public toString(): string {
      return ";";
    }
  }

  export namespace Semicolon {
    export interface JSON {
      [key: string]: json.JSON;
      type: "semicolon";
    }

    export function isSemicolon(value: unknown): value is Semicolon {
      return value instanceof Semicolon;
    }
  }

  export const { of: semicolon, isSemicolon } = Semicolon;

  export const parseSemicolon = parseToken(isSemicolon);

  export class Comma implements Equatable, Serializable<Comma.JSON> {
    private static _instance = new Comma();

    public static of(): Comma {
      return Comma._instance;
    }

    private constructor() {}

    public get type(): "comma" {
      return "comma";
    }

    public equals(value: unknown): value is this {
      return value instanceof Comma;
    }

    public toJSON(): Comma.JSON {
      return {
        type: "comma",
      };
    }

    public toString(): string {
      return ",";
    }
  }

  export namespace Comma {
    export interface JSON {
      [key: string]: json.JSON;
      type: "comma";
    }

    export function isComma(value: unknown): value is Comma {
      return value instanceof Comma;
    }
  }

  export const { of: comma, isComma } = Comma;

  export const parseComma = parseToken(isComma);

  export class OpenParenthesis
    implements Equatable, Serializable<OpenParenthesis.JSON>
  {
    private static _instance = new OpenParenthesis();

    public static of(): OpenParenthesis {
      return OpenParenthesis._instance;
    }

    private constructor() {}

    public get type(): "open-parenthesis" {
      return "open-parenthesis";
    }

    public get mirror(): CloseParenthesis {
      return CloseParenthesis.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof OpenParenthesis;
    }

    public toJSON(): OpenParenthesis.JSON {
      return {
        type: "open-parenthesis",
      };
    }

    public toString(): string {
      return "(";
    }
  }

  export namespace OpenParenthesis {
    export interface JSON {
      [key: string]: json.JSON;
      type: "open-parenthesis";
    }

    export function isOpenParenthesis(
      value: unknown,
    ): value is OpenParenthesis {
      return value instanceof OpenParenthesis;
    }
  }

  export const { of: openParenthesis, isOpenParenthesis } = OpenParenthesis;

  export const parseOpenParenthesis = parseToken(isOpenParenthesis);

  export class CloseParenthesis
    implements Equatable, Serializable<CloseParenthesis.JSON>
  {
    private static _instance = new CloseParenthesis();

    public static of(): CloseParenthesis {
      return CloseParenthesis._instance;
    }

    private constructor() {}

    public get type(): "close-parenthesis" {
      return "close-parenthesis";
    }

    public get mirror(): OpenParenthesis {
      return OpenParenthesis.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof CloseParenthesis;
    }

    public toJSON(): CloseParenthesis.JSON {
      return {
        type: "close-parenthesis",
      };
    }

    public toString(): string {
      return ")";
    }
  }

  export namespace CloseParenthesis {
    export interface JSON {
      [key: string]: json.JSON;
      type: "close-parenthesis";
    }

    export function isCloseParenthesis(
      value: unknown,
    ): value is CloseParenthesis {
      return value instanceof CloseParenthesis;
    }
  }

  export const { of: closeParenthesis, isCloseParenthesis } = CloseParenthesis;

  export const parseCloseParenthesis = parseToken(isCloseParenthesis);

  export class OpenSquareBracket
    implements Equatable, Serializable<OpenSquareBracket.JSON>
  {
    private static _instance = new OpenSquareBracket();

    public static of(): OpenSquareBracket {
      return OpenSquareBracket._instance;
    }

    private constructor() {}

    public get type(): "open-square-bracket" {
      return "open-square-bracket";
    }

    public get mirror(): CloseSquareBracket {
      return CloseSquareBracket.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof OpenSquareBracket;
    }

    public toJSON(): OpenSquareBracket.JSON {
      return {
        type: "open-square-bracket",
      };
    }

    public toString(): string {
      return "[";
    }
  }

  export namespace OpenSquareBracket {
    export interface JSON {
      [key: string]: json.JSON;
      type: "open-square-bracket";
    }

    export function isOpenSquareBracket(
      value: unknown,
    ): value is OpenSquareBracket {
      return value instanceof OpenSquareBracket;
    }
  }

  export const { of: openSquareBracket, isOpenSquareBracket } =
    OpenSquareBracket;

  export const parseOpenSquareBracket = parseToken(isOpenSquareBracket);

  export class CloseSquareBracket
    implements Equatable, Serializable<CloseSquareBracket.JSON>
  {
    private static _instance = new CloseSquareBracket();

    public static of(): CloseSquareBracket {
      return CloseSquareBracket._instance;
    }

    private constructor() {}

    public get type(): "close-square-bracket" {
      return "close-square-bracket";
    }

    public get mirror(): OpenSquareBracket {
      return OpenSquareBracket.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof CloseSquareBracket;
    }

    public toJSON(): CloseSquareBracket.JSON {
      return {
        type: "close-square-bracket",
      };
    }

    public toString(): string {
      return "]";
    }
  }

  export namespace CloseSquareBracket {
    export interface JSON {
      [key: string]: json.JSON;
      type: "close-square-bracket";
    }

    export function isCloseSquareBracket(
      value: unknown,
    ): value is CloseSquareBracket {
      return value instanceof CloseSquareBracket;
    }
  }

  export const { of: closeSquareBracket, isCloseSquareBracket } =
    CloseSquareBracket;

  export const parseCloseSquareBracket = parseToken(isCloseSquareBracket);

  export class OpenCurlyBracket
    implements Equatable, Serializable<OpenCurlyBracket.JSON>
  {
    private static _instance = new OpenCurlyBracket();

    public static of(): OpenCurlyBracket {
      return OpenCurlyBracket._instance;
    }

    private constructor() {}

    public get type(): "open-curly-bracket" {
      return "open-curly-bracket";
    }

    public get mirror(): CloseCurlyBracket {
      return CloseCurlyBracket.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof OpenCurlyBracket;
    }

    public toJSON(): OpenCurlyBracket.JSON {
      return {
        type: "open-curly-bracket",
      };
    }

    public toString(): string {
      return "{";
    }
  }

  export namespace OpenCurlyBracket {
    export interface JSON {
      [key: string]: json.JSON;
      type: "open-curly-bracket";
    }

    export function isOpenCurlyBracket(
      value: unknown,
    ): value is OpenCurlyBracket {
      return value instanceof OpenCurlyBracket;
    }
  }

  export const { of: openCurlyBracket, isOpenCurlyBracket } = OpenCurlyBracket;

  export const parseOpenCurlyBracket = parseToken(isOpenCurlyBracket);

  export class CloseCurlyBracket
    implements Equatable, Serializable<CloseCurlyBracket.JSON>
  {
    private static _instance = new CloseCurlyBracket();

    public static of(): CloseCurlyBracket {
      return CloseCurlyBracket._instance;
    }

    private constructor() {}

    public get type(): "close-curly-bracket" {
      return "close-curly-bracket";
    }

    public get mirror(): OpenCurlyBracket {
      return OpenCurlyBracket.of();
    }

    public equals(value: unknown): value is this {
      return value instanceof CloseCurlyBracket;
    }

    public toJSON(): CloseCurlyBracket.JSON {
      return {
        type: "close-curly-bracket",
      };
    }

    public toString(): string {
      return "}";
    }
  }

  export namespace CloseCurlyBracket {
    export interface JSON {
      [key: string]: json.JSON;
      type: "close-curly-bracket";
    }

    export function isCloseCurlyBracket(
      value: unknown,
    ): value is CloseCurlyBracket {
      return value instanceof CloseCurlyBracket;
    }
  }

  export const { of: closeCurlyBracket, isCloseCurlyBracket } =
    CloseCurlyBracket;

  export const parseCloseCurlyBracket = parseToken(isCloseCurlyBracket);

  export class OpenComment
    implements Equatable, Serializable<OpenComment.JSON>
  {
    private static _instance = new OpenComment();

    public static of(): OpenComment {
      return OpenComment._instance;
    }

    private constructor() {}

    public get type(): "open-comment" {
      return "open-comment";
    }

    public equals(value: unknown): value is this {
      return value instanceof OpenComment;
    }

    public toJSON(): OpenComment.JSON {
      return {
        type: "open-comment",
      };
    }

    public toString(): string {
      return "<!--";
    }
  }

  export namespace OpenComment {
    export interface JSON {
      [key: string]: json.JSON;
      type: "open-comment";
    }

    export function isOpenComment(value: unknown): value is OpenComment {
      return value instanceof OpenComment;
    }
  }

  export const { of: openComment, isOpenComment } = OpenComment;

  export const parseOpenComment = parseToken(isOpenComment);

  export class CloseComment
    implements Equatable, Serializable<CloseComment.JSON>
  {
    private static _instance = new CloseComment();

    public static of(): CloseComment {
      return CloseComment._instance;
    }

    private constructor() {}

    public get type(): "close-comment" {
      return "close-comment";
    }

    public equals(value: unknown): value is this {
      return value instanceof CloseComment;
    }

    public toJSON(): CloseComment.JSON {
      return {
        type: "close-comment",
      };
    }

    public toString(): string {
      return "-->";
    }
  }

  export namespace CloseComment {
    export interface JSON {
      [key: string]: json.JSON;
      type: "close-comment";
    }

    export function isCloseComment(value: unknown): value is CloseComment {
      return value instanceof CloseComment;
    }
  }

  export const { of: closeComment, isCloseComment } = CloseComment;

  export const parseCloseComment = parseToken(isCloseComment);
}
