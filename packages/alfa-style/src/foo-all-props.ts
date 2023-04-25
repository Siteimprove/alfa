import { Longhand } from "./foo-prop-class";

export namespace Foo {
  export type LongHands = typeof Bar.longHands;

  export type Name = keyof LongHands;

  /**
   * Extract the parsed type of a named property.
   *
   * @remarks
   * The parsed type differs from the declared type in that the parsed type
   * must not include the defaulting keywords as these are handled globally
   * rather than individually.
   *
   * @remarks
   * The parsed type doesn't really exist in CSS. It is an artefact on how we
   * handle the default keywords.
   */
  export type Parsed<N extends Name> = LongHands[N] extends Longhand<
    infer S,
    unknown
  >
    ? S
    : never;

  /**
   * Extract the declared type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#declared}
   *
   * @remarks
   * The declared type includes the parsed type in addition to the defaulting
   * keywords recognised by all properties. It is the type of what can actually
   * be written as the value of the property.
   */
  export type Declared<N extends Name> = Parsed<N> | Longhand.Value.Default;

  /**
   * Extract the cascaded type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#cascaded}
   */
  export type Cascaded<N extends Name> = Declared<N>;

  /**
   * Extract the specified type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#specified}
   */
  export type Specified<N extends Name> = Parsed<N> | Computed<N>;

  /**
   * Extract the computed type a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#computed}
   */
  export type Computed<N extends Name> = LongHands[N] extends Longhand<
    unknown,
    infer C
  >
    ? C
    : never;

  /**
   * Extract the initial type of a named property.
   */
  export type Initial<N extends Name> = Computed<N>;

  /**
   * Extract the inherited type of a named property.
   */
  export type Inherited<N extends Name> = Computed<N>;
}

import Height from "./property2/height";

export namespace Bar {
  export const longHands = {
    height: Height,
  } as const;

  export function isName(name: string): name is Foo.Name {
    return name in longHands;
  }

  export function get<N extends Foo.Name>(name: N): Foo.LongHands[N] {
    return longHands[name];
  }
}
