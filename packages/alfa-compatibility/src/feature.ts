import { Iterable } from "@siteimprove/alfa-iterable";
import { Browser } from "./browser";
import { Data } from "./feature/data";

export type Feature<
  N extends Feature.Name = Feature.Name,
  I extends Feature.Implementer<N> = Feature.Implementer<N>
> = Feature.Implementation<N, I>;

export namespace Feature {
  export type Name = Data.Name;

  export type Implementer<N extends Name> = Data.Implementer<N>;

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
    return feature in Data;
  }

  export function isImplementer<N extends Name>(
    feature: N,
    browser: Browser.Name
  ): browser is Implementer<N> {
    return browser in Data[feature];
  }

  function* getImplementers<N extends Name>(
    feature: N
  ): Iterable<Implementer<N>> {
    for (const implementer in Data[feature]) {
      if (
        Browser.isBrowser(implementer) &&
        isImplementer(feature, implementer)
      ) {
        yield implementer;
      }
    }
  }

  export function getScope<N extends Name>(
    feature: N,
    scope: Browser.Scope = Browser.getDefaultScope()
  ): Browser.Scope<Implementer<N>> {
    const support = Data[feature].support as Data.Support<N>;

    return Iterable.flatMap(
      getImplementers(feature),
      <I extends Implementer<N>>(browser: I) => {
        const { added, removed } = support[browser] as Data.Implementation<
          N,
          I
        >;

        let query: Browser.Query<I>;

        if (added === true) {
          query = [browser];
        } else if (removed === undefined) {
          query = [browser, ">=", added];
        } else {
          query = [browser, added, removed];
        }

        return Browser.query(query, scope);
      }
    );
  }
}

namespace Data {
  type Keys<T, E extends string | number | symbol = string> = T extends {}
    ? Extract<keyof T, E>
    : never;

  export type Name = Keys<Data>;

  export type Feature<N extends Name> = Data[N];

  export type Support<N extends Name> = Feature<N>["support"];

  export type Implementer<N extends Name> = Extract<
    Keys<Support<N>>,
    Browser.Name
  >;

  export type Implementation<
    N extends Name,
    I extends Implementer<N>
  > = Extract<
    Support<N>[I],
    {
      added: true | Browser.Version<I>;
      removed?: Browser.Version<I>;
    }
  >;
}
