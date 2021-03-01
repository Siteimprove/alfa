import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import * as global from "./global";

const { isEmpty } = Iterable;

/**
 * {@link https://url.spec.whatwg.org/}
 *
 * @public
 */
export class URL implements Equatable, Hashable, Serializable<URL.JSON> {
  public static of(
    scheme: string,
    username: Option<string> = None,
    password: Option<string> = None,
    host: Option<string> = None,
    port: Option<number> = None,
    path: Iterable<string> = [],
    query: Option<string> = None,
    fragment: Option<string> = None,
    cannotBeABase: boolean = false
  ): URL {
    return new URL(
      scheme,
      username,
      password,
      host,
      port,
      Sequence.from(path),
      query,
      fragment,
      cannotBeABase
    );
  }

  /**
   * {@link https://tools.ietf.org/html/rfc2606#section-3}
   */
  public static example(): URL {
    return URL.parse("https://example.com").get();
  }

  /**
   * {@link https://tools.ietf.org/html/rfc6694#section-3}
   */
  public static blank(): URL {
    return URL.parse("about:blank").get();
  }

  private readonly _scheme: string;
  private readonly _username: Option<string>;
  private readonly _password: Option<string>;
  private readonly _host: Option<string>;
  private readonly _port: Option<number>;
  private readonly _path: Sequence<string>;
  private readonly _query: Option<string>;
  private readonly _fragment: Option<string>;
  private readonly _cannotBeABase: boolean;

  private constructor(
    scheme: string,
    username: Option<string>,
    password: Option<string>,
    host: Option<string>,
    port: Option<number>,
    path: Sequence<string>,
    query: Option<string>,
    fragment: Option<string>,
    cannotBeABase: boolean
  ) {
    this._scheme = scheme;
    this._username = username;
    this._password = password;
    this._host = host;
    this._port = port;
    this._path = path;
    this._query = query;
    this._fragment = fragment;
    this._cannotBeABase = cannotBeABase;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-scheme}
   */
  public get scheme(): string {
    return this._scheme;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-username}
   */
  public get username(): Option<string> {
    return this._username;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-password}
   */
  public get password(): Option<string> {
    return this._password;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-host}
   */
  public get host(): Option<string> {
    return this._host;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-port}
   */
  public get port(): Option<number> {
    return this._port;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-path}
   */
  public get path(): Sequence<string> {
    return this._path;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-query}
   */
  public get query(): Option<string> {
    return this._query;
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-fragment}
   */
  public get fragment(): Option<string> {
    return this._fragment;
  }

  /**
   * {@link https://url.spec.whatwg.org/#url-cannot-be-a-base-url-flag}
   */
  public get cannotBeABase(): boolean {
    return this._cannotBeABase;
  }

  /**
   * {@link https://url.spec.whatwg.org/#is-special}
   */
  public isSpecial(): boolean {
    return URL.isSpecialScheme(this._scheme);
  }

  /**
   * {@link https://url.spec.whatwg.org/#include-credentials}
   */
  public hasCredentials(): boolean {
    return this._username.isSome() || this._password.isSome();
  }

  /**
   * Remove the fragment portion of this URL.
   *
   * @remarks
   * This method is useful for contexts in which the fragment portion of the URL,
   * which isn't passed from client to server, is of no interest.
   */
  public withoutFragment(): URL {
    if (this._fragment.isNone()) {
      return this;
    }

    return new URL(
      this._scheme,
      this._username,
      this._password,
      this._host,
      this._port,
      this._path,
      this._query,
      None,
      this._cannotBeABase
    );
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-equals}
   */
  public equals(value: URL): boolean;

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-equals}
   */
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof URL &&
      value._scheme === this._scheme &&
      value._username.equals(this._username) &&
      value._password.equals(this._password) &&
      value._host.equals(this._host) &&
      value._port.equals(this._port) &&
      value._path.equals(this._path) &&
      value._query.equals(this._query) &&
      value._fragment.equals(this._fragment) &&
      value._cannotBeABase === this._cannotBeABase
    );
  }

  public hash(hash: Hash): void {
    hash
      .writeString(this._scheme)
      .writeHashable(this._username)
      .writeHashable(this._password)
      .writeHashable(this._host)
      .writeHashable(this._port)
      .writeHashable(this._path)
      .writeHashable(this._query)
      .writeHashable(this._fragment)
      .writeBoolean(this._cannotBeABase);
  }

  public toJSON(): URL.JSON {
    return {
      scheme: this._scheme,
      username: this._username.getOr(null),
      password: this._password.getOr(null),
      host: this._host.getOr(null),
      port: this._port.getOr(null),
      path: this._path.toArray(),
      query: this._query.getOr(null),
      fragment: this._fragment.getOr(null),
      cannotBeABase: this._cannotBeABase,
    };
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-serializer}
   */
  public toString(): string {
    let output = this._scheme + ":";

    for (const host of this._host) {
      output += "//";

      if (this.hasCredentials()) {
        for (const username of this._username) {
          output += username;
        }

        for (const password of this._password) {
          output += ":" + password;
        }

        output += "@";
      }

      output += host;

      for (const port of this._port) {
        output += ":" + port.toString(10);
      }
    }

    if (this._cannotBeABase) {
      output += this._path.get(0).get();
    } else {
      if (
        this._host.isNone() &&
        this._path.size > 1 &&
        this._path.first().includes("")
      ) {
        output += "/.";
      }

      for (const segment of this._path) {
        output += "/" + segment;
      }
    }

    for (const query of this._query) {
      output += "?" + query;
    }

    for (const fragment of this._fragment) {
      output += "#" + fragment;
    }

    return output;
  }
}

/**
 * @public
 */
export namespace URL {
  export interface JSON {
    [key: string]: json.JSON;
    scheme: string;
    username: string | null;
    password: string | null;
    host: string | null;
    port: number | null;
    path: Array<string>;
    query: string | null;
    fragment: string | null;
    cannotBeABase: boolean;
  }

  export function from(json: JSON): URL {
    return URL.of(
      json.scheme,
      Option.from(json.username),
      Option.from(json.password),
      Option.from(json.host),
      Option.from(json.port),
      json.path,
      Option.from(json.query),
      Option.from(json.fragment)
    );
  }

  /**
   * {@link https://url.spec.whatwg.org/#concept-url-parser}
   *
   * @remarks
   * Parsing URLs is tricky business and so this function relies on the presence
   * of a globally available WHATWG URL class. This API is available in both
   * browsers, Node.js, and Deno.
   */
  export function parse(url: string, base?: string | URL): Result<URL, string> {
    if (typeof base === "string") {
      const result = parse(base);

      if (result.isErr()) {
        return result;
      }

      base = result.get();
    }

    try {
      const {
        // https://url.spec.whatwg.org/#dom-url-protocol
        protocol,
        // https://url.spec.whatwg.org/#dom-url-username
        username,
        // https://url.spec.whatwg.org/#dom-url-password
        password,
        // https://url.spec.whatwg.org/#dom-url-hostname
        hostname,
        // https://url.spec.whatwg.org/#dom-url-port
        port,
        // https://url.spec.whatwg.org/#dom-url-pathname
        pathname,
        // https://url.spec.whatwg.org/#dom-url-search
        search,
        // https://url.spec.whatwg.org/#dom-url-hash
        hash,
      } = new global.URL(url, base?.toString());

      // `URL#protocol` appends a ":" to the scheme which we need to remove.
      const scheme = protocol.replace(/:$/, "");

      return Result.of(
        URL.of(
          scheme,

          // `URL#username` `URL#password` expose the username and password
          // as-is and so the only thing we need to do is reject them when
          // empty.
          Option.of(username).reject(isEmpty),
          Option.of(password).reject(isEmpty),

          // `URL#hostname` exposes the host as an empty string if the host is
          // `null`. For the `file` scheme, however, the empty string is
          // significant and we therefore don't translate it into `None`.
          scheme === "file"
            ? Option.of(hostname)
            : Option.of(hostname).reject(isEmpty),

          // `URL#port` exposes the port number as a string to we convert it to
          // a number.
          Option.of(port).reject(isEmpty).map(Number),

          // `URL#pathname` exposes the path segments with a leading "/" and
          // joins the segments with "/". We therefore remove the leading "/"
          // and split the segments by "/" into an array.
          pathname.replace(/^\//, "").split("/"),

          // `URL#search` exposes the query portion of the URL with a leading
          // "?" which we need to remove.
          Option.of(search)
            .reject(isEmpty)
            .map((search) => search.replace(/^\?/, "")),

          // `URL#hash` exposes the fragment portion of the URL with a leading
          // "#" which we need to remove.
          Option.of(hash)
            .reject(isEmpty)
            .map((hash) => hash.replace(/^#/, "")),

          // The URL cannot be used as a base URL when the scheme isn't
          // special and the pathname doesn't start with a leading "/".
          !isSpecialScheme(scheme) && pathname[0] !== "/"
        )
      );
    } catch (err) {
      return Err.of(err.message);
    }
  }

  /**
   * {@link https://url.spec.whatwg.org/#special-scheme}
   */
  export function isSpecialScheme(scheme: string): boolean {
    switch (scheme) {
      case "ftp":
      case "file":
      case "http":
      case "https":
      case "ws":
      case "wss":
        return true;

      default:
        return false;
    }
  }
}
