import * as browserslist from "browserslist";

import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import * as data from "./browser/data";

export type Browser<
  N extends Browser.Name = Browser.Name,
  V extends Browser.Version<N> = Browser.Version<N>
> = Browser.Release<N, V>;

export namespace Browser {
  export type Name = Data.Name;

  export type Version<N extends Name> = Data.Version<N>;

  export class Release<N extends Name = Name, V extends Version<N> = Version<N>>
    implements Serializable {
    /**
     * @internal
     */
    public static of<N extends Name, V extends Version<N>>(
      browser: N,
      version: V,
      date: number
    ): Release<N, V> {
      return new Release(browser, version, date);
    }

    private readonly _browser: N;
    private readonly _version: V;
    private readonly _date: number;

    private constructor(browser: N, version: V, date: number) {
      this._browser = browser;
      this._version = version;
      this._date = date;
    }

    public get browser(): N {
      return this._browser;
    }

    public get version(): V {
      return this._version;
    }

    /**
     * @internal
     */
    public get date(): number {
      return this._date;
    }

    public toJSON(): Release.JSON {
      return {
        browser: this._browser,
        version: this._version,
      };
    }

    public toString(): string {
      return `Release { ${this._browser} ${this._version} }`;
    }
  }

  export namespace Release {
    export interface JSON {
      [key: string]: json.JSON;
      browser: string;
      version: string;
    }
  }

  export type Scope<N extends Name = Name> = Iterable<Release<N>>;

  export function isBrowser(browser: string): browser is Name {
    return browser in data.Data;
  }

  function* getBrowsers(): Iterable<Name> {
    for (const browser in data.Data) {
      if (isBrowser(browser)) {
        yield browser;
      }
    }
  }

  export function isVersion<N extends Name>(
    browser: N,
    version: string
  ): version is Version<N> {
    return version in data.Data[browser].releases;
  }

  function* getVersions<N extends Name>(browser: N): Iterable<Version<N>> {
    for (const version in data.Data[browser].releases) {
      if (isVersion(browser, version)) {
        yield version;
      }
    }
  }

  type Versions<N extends Name> = { [V in Version<N>]: Release<N, V> };

  type Releases = { [N in Name]: Versions<N> };

  const releases = [...getBrowsers()].reduce(
    <N extends Name>(support: Releases, browser: N) => {
      const releases = data.Data[browser].releases as Data.Releases<N>;

      return {
        ...support,
        [browser]: [...getVersions(browser)].reduce(
          <V extends Version<N>>(support: Versions<N>, version: V) => {
            const { date } = releases[version] as Data.Release<N, V>;

            return {
              ...support,
              [version]: Release.of(browser, version, date),
            };
          },
          {} as Versions<N>
        ),
      };
    },
    {} as Releases
  );

  function getRelease<N extends Name, V extends Version<N>>(
    browser: N,
    version: V
  ): Release<N, V> {
    return (releases[browser] as Versions<N>)[version];
  }

  export type Query<N extends Name = Name> =
    | Query.Every<N>
    | Query.Single<N>
    | Query.Range<N>;

  export namespace Query {
    export type Comparator = ">" | "<" | ">=" | "<=";

    export type Every<N extends Name> = readonly [N];

    export type Single<N extends Name> = readonly [N, Version<N>];

    export type Range<N extends Name> =
      | readonly [N, Comparator, Version<N>]
      | readonly [N, Version<N>, Version<N>];

    export function isEvery<N extends Name>(
      query: Query<N>
    ): query is Every<N> {
      return query.length === 1;
    }

    export function isSingle<N extends Name>(
      query: Query<N>
    ): query is Single<N> {
      return query.length === 2;
    }

    export function isRange<N extends Name>(
      query: Query<N>
    ): query is Range<N> {
      return query.length === 3;
    }
  }

  export function* query<N extends Name>(
    query: Query<N>,
    scope: Scope = getDefaultScope()
  ): Scope<N> {
    const browser = query[0];
    const support = Iterable.filter(
      scope,
      (release): release is Release<N> => release.browser === browser
    );

    if (Query.isEvery(query)) {
      yield* support;
    } else if (Query.isSingle(query)) {
      const version = query[1];
      const release = getRelease(browser, version);

      if (Iterable.includes(support, release)) {
        yield release;
      }
    } else {
      let lower = 0;
      let upper = Infinity;

      switch (query[1]) {
        case "<":
          upper = getRelease(browser, query[2]).date - 1;
          break;
        case ">":
          lower = getRelease(browser, query[2]).date + 1;
          break;
        case "<=":
          upper = getRelease(browser, query[2]).date;
          break;
        case ">=":
          lower = getRelease(browser, query[2]).date;
          break;

        default:
          lower = getRelease(browser, query[1]).date;
          upper = getRelease(browser, query[2]).date - 1;
      }

      for (const version of getVersions(browser)) {
        const release = getRelease(browser, version);

        if (
          release.date >= lower &&
          release.date <= upper &&
          Iterable.includes(support, release)
        ) {
          yield release;
        }
      }
    }
  }

  const defaultScope: Scope = browserslist()
    .map((entry) => {
      const [browser, version] = entry.split(/\s+/);

      if (!Browser.isBrowser(browser) || !Browser.isVersion(browser, version)) {
        return null;
      }

      return getRelease(browser, version);
    })
    .filter((release: Release | null): release is Release => release !== null);

  export function getDefaultScope(): Scope {
    return defaultScope;
  }
}

namespace Data {
  type Keys<T, E extends string | number | symbol = string> = T extends {}
    ? Extract<keyof T, E>
    : never;

  export type Name = Keys<data.Data>;

  export type Browser<N extends Name> = data.Data[N];

  export type Releases<N extends Name> = Browser<N>["releases"];

  export type Version<N extends Name> = Keys<Releases<N>>;

  export type Release<N extends Name, V extends Version<N>> = Extract<
    Releases<N>[V],
    { date: number }
  >;
}
