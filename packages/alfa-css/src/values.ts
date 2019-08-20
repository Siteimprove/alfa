import { Units } from "./units";

export const enum ValueType {
  List,
  Tuple,
  Dictionary,
  Keyword,
  Boolean,
  String,
  Integer,
  Number,
  Percentage,
  Length,
  Angle,
  Function,
  Color
}

/**
 * @see https://www.w3.org/TR/css-values/
 */
export interface Value<T = unknown> {
  readonly type: ValueType;
  readonly value: T;
}

export namespace Values {
  export interface List<T extends Value> extends Value<Array<T>> {
    readonly type: ValueType.List;
  }

  export function list<T extends Value, U extends Array<T>>(
    ...value: U
  ): Values.List<T> {
    return { type: ValueType.List, value };
  }

  export function isList(value: Value): value is List<Value> {
    return value.type === ValueType.List;
  }

  export interface Tuple<T extends [Value, ...Array<Value>]> extends Value<T> {
    readonly type: ValueType.Tuple;
  }

  export function tuple<T extends [Value, ...Array<Value>]>(
    ...value: T
  ): Tuple<T> {
    return { type: ValueType.Tuple, value };
  }

  export function isTuple(
    value: Value
  ): value is Tuple<[Value, ...Array<Value>]> {
    return value.type === ValueType.Tuple;
  }

  export interface Dictionary<T extends { [key: string]: Value | undefined }>
    extends Value<T> {
    readonly type: ValueType.Dictionary;
  }

  export function dictionary<T extends { [key: string]: Value }>(
    value: T
  ): Values.Dictionary<T> {
    return { type: ValueType.Dictionary, value };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#keywords
   */
  export interface Keyword<T extends string | number> extends Value<T> {
    readonly type: ValueType.Keyword;
  }

  export function keyword<T extends string>(value: T): Keyword<T> {
    return { type: ValueType.Keyword, value };
  }

  export function isKeyword(value: Value): value is Keyword<string>;

  export function isKeyword<T extends string>(
    value: Value,
    ...keyword: Array<T>
  ): value is Keyword<T>;

  export function isKeyword<T extends string = string>(
    value: Value,
    ...keywords: Array<T>
  ): value is Keyword<T> {
    if (value.type !== ValueType.Keyword) {
      return false;
    }

    return (
      keywords.length === 0 ||
      keywords.some(keyword => (value as Keyword<string>).value === keyword)
    );
  }

  export interface Boolean extends Value<boolean> {
    readonly type: ValueType.Boolean;
  }

  const t: Boolean = { type: ValueType.Boolean, value: true };
  const f: Boolean = { type: ValueType.Boolean, value: false };

  export function boolean(value: boolean): Boolean {
    return value ? t : f;
  }

  /**
   * @see https://www.w3.org/TR/css-values/#strings
   */
  export interface String extends Value<string> {
    readonly type: ValueType.String;
  }

  export function string(value: string): String {
    return { type: ValueType.String, value };
  }

  export function isString(value: Value): value is String {
    return value.type === ValueType.String;
  }

  /**
   * @see https://www.w3.org/TR/css-values/#integers
   */
  export interface Integer extends Value<number> {
    readonly type: ValueType.Integer;
  }

  export function integer(value: number): Integer {
    return { type: ValueType.Integer, value };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#numbers
   */
  export interface Number extends Value<number> {
    readonly type: ValueType.Number;
  }

  export function number(value: number): Number {
    return { type: ValueType.Number, value };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#percentages
   */
  export interface Percentage extends Value<number> {
    readonly type: ValueType.Percentage;
  }

  export function percentage(value: number): Percentage {
    return { type: ValueType.Percentage, value };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#lengths
   */
  export interface Length<U extends Units.Length = Units.Length>
    extends Value<number> {
    readonly type: ValueType.Length;
    readonly unit: U;
  }

  export function length<U extends Units.Length>(
    value: number,
    unit: U
  ): Length<U> {
    return { type: ValueType.Length, value, unit };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#angles
   */
  export interface Angle<U extends Units.Angle = Units.Angle>
    extends Value<number> {
    readonly type: ValueType.Angle;
    readonly unit: U;
  }

  export function angle<U extends Units.Angle>(
    value: number,
    unit: U
  ): Angle<U> {
    return { type: ValueType.Angle, value, unit };
  }

  /**
   * @see https://www.w3.org/TR/css-values/#functional-notations
   */
  export interface Function<
    N extends string,
    A extends readonly [Value | undefined, ...Array<Value | undefined>]
  > extends Value<{ readonly name: N; readonly args: A }> {
    readonly type: ValueType.Function;
  }

  export function func<
    N extends string,
    A extends readonly [Value, ...Array<Value>]
  >(name: N, args: A): Function<N, A> {
    return { type: ValueType.Function, value: { name, args } };
  }
}
