import { Token } from "./alphabet";
import { Value, Values } from "./values";

import * as Longhands from "./properties/longhands";

type Longhands = typeof Longhands;

export type ParsedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T
    : never
};

export type InitialPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never
};

export type CascadedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | Values.Keyword<"initial" | "inherit">
    : never
};

export type SpecifiedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? T | U
    : never
};

export type ComputedPropertyValues = {
  [N in keyof Longhands]: Longhands[N] extends Longhand<infer T, infer U>
    ? U
    : never
};

export interface Longhand<T extends Value, U extends T = T> {
  /**
   * @internal
   */
  readonly inherits?: true;

  /**
   * @internal
   */
  parse(input: Array<Token>): T | null;

  /**
   * @internal
   */
  initial(): T | U;

  /**
   * @internal
   */
  computed(
    /**
     *
     */
    getProperty: <N extends keyof Longhands>(
      propertyName: N
    ) => SpecifiedPropertyValues[N],
    /**
     *
     */
    getParentProperty: <N extends keyof Longhands>(
      propertyName: N
    ) => ComputedPropertyValues[N]
  ): U;
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
  ): { readonly [M in N]?: ParsedPropertyValues[M] } | null;
}
