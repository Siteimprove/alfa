import { values } from "@alfa/util";
import { Grammar } from "@alfa/lang";
import { Token } from "./alphabet";
import { Properties } from "./properties";

/**
 * @see https://www.w3.org/TR/css-cascade/#initial
 */
export type Initial = "initial";

/**
 * @see https://www.w3.org/TR/css-cascade/#inherit
 */
export type Inherit = "inherit";

export enum Stage {
  /**
   * @see https://www.w3.org/TR/css-cascade/#cascaded
   */
  Cascaded,

  /**
   * @see https://www.w3.org/TR/css-cascade/#specified
   */
  Specified,

  /**
   * @see https://www.w3.org/TR/css-cascade/#computed
   */
  Computed
}

export type PropertyName = keyof typeof Properties;

export type PropertyType<P> = P extends Property<infer T> ? T : never;

export interface Property<T> {
  readonly grammar: Grammar<Token, T>;
  readonly inherits: boolean;

  initial(): T | null;

  computed(
    own: Style<Stage.Specified>,
    parent: Style<Stage.Computed>
  ): T | null;
}

export type StyleValue<S extends Stage, V> = S extends Stage.Cascaded
  ? V | Initial | Inherit
  : V;

export type Style<S extends Stage = Stage.Computed> = Readonly<
  {
    [Name in PropertyName]?: StyleValue<
      S,
      PropertyType<typeof Properties[Name]>
    >
  }
>;
