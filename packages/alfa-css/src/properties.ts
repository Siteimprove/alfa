import { Device } from "@siteimprove/alfa-device";
import { Token } from "./alphabet";
import { Style } from "./style";
import { Value, Values } from "./values";

import * as Longhands from "./properties/longhands";

type Longhands = typeof Longhands;

type ParsedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T
    : never;
};

export type ParsedPropertyValue<
  N extends keyof Longhands
> = ParsedPropertyValues[N];

type InitialPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never;
};

export type InitialPropertyValue<
  N extends keyof Longhands
> = InitialPropertyValues[N];

type CascadedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | Values.Keyword<"initial" | "inherit">
    : never;
};

export type CascadedPropertyValue<
  N extends keyof Longhands = keyof Longhands
> = CascadedPropertyValues[N];

type SpecifiedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never;
};

export type SpecifiedPropertyValue<
  N extends keyof Longhands = keyof Longhands
> = SpecifiedPropertyValues[N];

type ComputedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? U
    : never;
};

export type ComputedPropertyValue<
  N extends keyof Longhands = keyof Longhands
> = ComputedPropertyValues[N];

export interface Longhand<T extends Value, U extends T = T> {
  /**
   * @internal
   */
  readonly inherits?: true;

  /**
   * @internal
   */
  readonly depends?: Array<keyof Longhands>;

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
  computed(style: Style, device: Device): U;
}

export interface Shorthand<N extends keyof Longhands> {
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
