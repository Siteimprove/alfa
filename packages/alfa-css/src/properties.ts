import { Device } from "@siteimprove/alfa-device";
import { Token } from "./alphabet";
import { Style, StyleValue } from "./style";
import { Value, Values } from "./values";

import * as Longhands from "./properties/longhands";

type Longhands = typeof Longhands;

export type PropertyName = keyof Longhands;

type ParsedPropertyValues = {
  [N in PropertyName]: Longhands[N] extends Longhand<infer T, infer U>
    ? T
    : never;
};

export type ParsedPropertyValue<
  N extends PropertyName
> = ParsedPropertyValues[N];

type InitialPropertyValues = {
  [N in PropertyName]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never;
};

export type InitialPropertyValue<
  N extends PropertyName = PropertyName
> = InitialPropertyValues[N];

type CascadedPropertyValues = {
  [N in PropertyName]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | Values.Keyword<"initial" | "inherit">
    : never;
};

export type CascadedPropertyValue<
  N extends PropertyName = PropertyName
> = CascadedPropertyValues[N];

type SpecifiedPropertyValues = {
  [N in PropertyName]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never;
};

export type SpecifiedPropertyValue<
  N extends PropertyName = PropertyName
> = SpecifiedPropertyValues[N];

type ComputedPropertyValues = {
  [N in PropertyName]: Longhands[N] extends Longhand<infer T, infer U>
    ? U
    : never;
};

export type ComputedPropertyValue<
  N extends PropertyName = PropertyName
> = ComputedPropertyValues[N];

export interface Longhand<T extends Value, U extends T = T> {
  /**
   * @internal
   */
  readonly inherits?: true;

  /**
   * @internal
   */
  readonly depends?: Array<PropertyName>;

  /**
   * @internal
   */
  parse(input: Array<Token>): T | null;

  /**
   * @internal
   */
  initial(): U;

  /**
   * @internal
   */
  computed<S>(style: Style<S>, device: Device): StyleValue<U, S>;
}

export interface Shorthand<N extends PropertyName> {
  /**
   * @internal
   */
  readonly longhands: Array<N>;

  /**
   * @internal
   */
  parse(
    input: Array<Token>
  ): { readonly [M in N]?: ParsedPropertyValue<M> } | null;
}
