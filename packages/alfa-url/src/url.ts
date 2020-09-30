import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

const { isEmpty } = Iterable;

/**
 * @see https://url.spec.whatwg.org/
 */
export class URL implements Equatable, Hashable, Serializable {
  public static of(
    scheme: string,
    username: Option<string> = None,
    password: Option<string> = None,
    host: Option<string> = None,
    port: Option<number> = None,
    path: Iterable<string> = [],
    query: Option<string> = None,
    fragment: Option<string> = None
  ): URL {
    return new URL(
      scheme,
      username,
      password,
      host,
      port,
      Sequence.from(path),
      query,
      fragment
    );
  }
  private readonly _scheme: string;
  private readonly _username: Option<string>;
  private readonly _password: Option<string>;
  private readonly _host: Option<string>;
  private readonly _port: Option<number>;
  private readonly _path: Sequence<string>;
  private readonly _query: Option<string>;
  private readonly _fragment: Option<string>;

  private constructor(
    scheme: string,
    username: Option<string>,
    password: Option<string>,
    host: Option<string>,
    port: Option<number>,
    path: Sequence<string>,
    query: Option<string>,
    fragment: Option<string>
  ) {
    this._scheme = scheme;
    this._username = username;
    this._password = password;
    this._host = host;
    this._port = port;
    this._path = path;
    this._query = query;
    this._fragment = fragment;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-scheme
   */
  public get scheme(): string {
    return this._scheme;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-username
   */
  public get username(): Option<string> {
    return this._username;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-password
   */
  public get password(): Option<string> {
    return this._password;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-host
   */
  public get host(): Option<string> {
    return this._host;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-port
   */
  public get port(): Option<number> {
    return this._port;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-path
   */
  public get path(): Sequence<string> {
    return this._path;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-query
   */
  public get query(): Option<string> {
    return this._query;
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-fragment
   */
  public get fragment(): Option<string> {
    return this._fragment;
  }

  /**
   * @see https://url.spec.whatwg.org/#include-credentials
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
      None
    );
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-equals
   */
  public equals(value: URL): boolean;

  /**
   * @see https://url.spec.whatwg.org/#concept-url-equals
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
      value._fragment.equals(this._fragment)
    );
  }

  public hash(hash: Hash): void {
    Hash.writeString(hash, this._scheme);
    this._username.hash(hash);
    this._password.hash(hash);
    this._host.hash(hash);
    this._port.hash(hash);
    this._path.hash(hash);
    this._query.hash(hash);
    this._fragment.hash(hash);
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
    };
  }

  /**
   * @see https://url.spec.whatwg.org/#concept-url-serializer
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

    if (this._host.isNone() && this._scheme === "file") {
      output += "//";
    }

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

    for (const query of this._query) {
      output += "?" + query;
    }

    for (const fragment of this._fragment) {
      output += "#" + fragment;
    }

    return output;
  }
}

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
  }

  export function parse(url: string, base?: string | URL): Result<URL, string> {
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
      } = new globalThis.URL(url, base?.toString());

      return Result.of(
        URL.of(
          protocol.slice(0, -1),
          Option.of(username).reject(isEmpty),
          Option.of(password).reject(isEmpty),
          Option.of(hostname).reject(isEmpty),
          Option.of(port).reject(isEmpty).map(Number),
          pathname.slice(1).split("/"),
          Option.of(search)
            .reject(isEmpty)
            .map((search) => search.slice(1)),
          Option.of(hash)
            .reject(isEmpty)
            .map((hash) => hash.slice(1))
        )
      );
    } catch (err) {
      return Err.of(err.message);
    }
  }
}
