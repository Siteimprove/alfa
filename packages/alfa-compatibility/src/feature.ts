import { Iterable } from "@siteimprove/alfa-iterable";

import { Browser } from "./browser";
import { Features } from "./feature/data";

/**
 * @public
 */
export type Feature<
  N extends Feature.Name = Feature.Name,
  I extends Feature.Implementer<N> = Feature.Implementer<N>
> = Feature.Implementation<N, I>;

/**
 * @public
 */
export namespace Feature {
  export type Name = keyof Features;

  /**
   * @remarks
   * This type distributes the implementers over the given feature names rather
   * than narrow to a common subset of implementers.
   */
  export type Implementer<N extends Name> = N extends Name
    ? keyof Features[N]["support"]
    : never;

  export interface Implementation<
    N extends Name = Name,
    I extends Implementer<N> = Implementer<N>
  > {
    readonly added: Browser.Version<I> | true;
    readonly removed?: Browser.Version<I>;
  }

  export type Support<N extends Name = Name> = {
    readonly [I in Implementer<N>]: Implementation<N, I>;
  };

  export function isFeature(feature: string): feature is Name {
    return feature in Features;
  }

  export function isImplementer<N extends Name>(
    feature: N,
    browser: Browser.Name
  ): browser is Implementer<N> {
    return browser in Features[feature];
  }

  function* getImplementers<N extends Name>(
    feature: N
  ): Iterable<Implementer<N>> {
    for (const browser in Features[feature].support) {
      const implementer = browser as Browser.Name;

      if (isImplementer(feature, implementer)) {
        yield implementer;
      }
    }
  }

  export function getScope<N extends Name>(
    feature: N,
    scope: Browser.Scope = Browser.getDefaultScope()
  ): Browser.Scope<Implementer<N>> {
    const support = Features[feature].support;

    return Iterable.flatMap(
      getImplementers(feature),
      <I extends Implementer<N>>(browser: I) => {
        const { added } = support[browser as keyof typeof support];

        const query: Browser.Query<I> = [
          browser,
          ">=",
          added as Browser.Version<I>,
        ];

        return Browser.query(query, scope);
      }
    );
  }
}
