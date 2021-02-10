import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { URL } from "@siteimprove/alfa-url";

import * as json from "@siteimprove/alfa-json";

const { equals, property } = Predicate;

export class Frontier implements Equatable, Serializable {
  public static of(
    scope: string | URL,
    seed: Iterable<string | URL> = [scope]
  ) {
    return new Frontier(
      toURL(scope),
      [...seed].filter((url) => isInScope(scope, url)).map(Item.of)
    );
  }

  public static from(json: Frontier.JSON): Frontier {
    return new Frontier(toURL(json.scope), json.items.map(Item.from));
  }

  private readonly _scope: URL;
  private readonly _items: Array<Item>;

  private constructor(scope: URL, items: Array<Item>) {
    this._scope = scope;
    this._items = items;
  }

  public get scope(): URL {
    return this._scope;
  }

  public isInScope(url: string | URL): boolean {
    return toURL(url).toString().startsWith(this._scope.toString());
  }

  public hasWaiting(): boolean {
    return this._items.some((item) => item.isWaiting());
  }

  public hasInProgress(): boolean {
    return this._items.some((item) => item.isInProgress());
  }

  public hasCompleted(): boolean {
    return this._items.some((item) => item.isCompleted());
  }

  public isWaiting(url: string | URL): boolean {
    return this._items.some((item) => item.isWaiting() && item.matches(url));
  }

  public isInProgress(url: string | URL): boolean {
    return this._items.some((item) => item.isInProgress() && item.matches(url));
  }

  public isCompleted(url: string | URL): boolean {
    return this._items.some((item) => item.isCompleted() && item.matches(url));
  }

  /**
   * Check if a URL has been seen by this frontier.
   */
  public isSeen(url: string | URL): boolean {
    return this._items.some((item) => item.matches(url));
  }

  /**
   * Check if the URL has not yet been seen by the frontier.
   */
  public isUnseen(url: string | URL): boolean {
    return !this.isSeen(url);
  }

  /**
   * Add a new URL to this frontier. If the URL is either not in scope or has
   * already been seen, the URL is not added to the frontier and `false` is
   * returned. Otherwise, `true` is returned.
   */
  public enqueue(url: string | URL): boolean {
    url = toURL(url);

    if (!this.isInScope(url) || this.isSeen(url)) {
      return false;
    }

    this._items.push(Item.of(url));

    return true;
  }

  /**
   * Pop the next URL from this frontier, transitioning it to in progress.
   */
  public dequeue(): Option<URL> {
    const item = this._items.find((item) => item.isWaiting());

    if (item === undefined) {
      return None;
    }

    item.transition(State.InProgress);

    return Option.of(item.url);
  }

  /**
   * Retry an already completed or errored URL.
   */
  public retry(url: string | URL): boolean {
    url = toURL(url);

    const item = this._items.find((item) => item.matches(url));

    if (item === undefined) {
      return false;
    }

    return item.transition(State.InProgress);
  }

  /**
   * Mark a URL as completed.
   */
  public complete(url: string | URL): boolean {
    url = toURL(url);

    const item = this._items.find((item) => item.matches(url));

    if (item === undefined) {
      return false;
    }

    return item.transition(State.Completed);
  }

  /**
   * Mark a URL as errored.
   */
  public error(url: string | URL): boolean {
    url = toURL(url);

    const item = this._items.find((item) => item.matches(url));

    if (item === undefined) {
      return false;
    }

    return item.transition(State.Error);
  }

  /**
   * Configure a redirect from one URL to another.
   */
  public redirect(from: string | URL, to: string | URL): boolean {
    // First, attempt to find the URL being redirected to. If it already exists
    // within this frontier, add the URL being redirected from as an alias.
    {
      const item = this._items.find((item) => item.matches(to));

      if (item !== undefined) {
        return item.alias(from);
      }
    }

    // Otherwise, attempt to find the URL being redirected from. If it exists
    // within this frontier, configure a redirect for the URL being redirected
    // to.
    {
      const item = this._items.find((item) => item.matches(from));

      if (item !== undefined) {
        return item.redirect(to);
      }
    }

    // If neither URL was found within this frontier, no redirect can be
    // configured.
    return false;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Frontier &&
      value._scope.equals(this._scope) &&
      value._items.length === this._items.length &&
      value._items.every((item, i) => item.equals(this._items[i]))
    );
  }

  public toJSON(): Frontier.JSON {
    return {
      scope: this._scope.toString(),
      items: this._items.map((item) => item.toJSON()),
    };
  }
}

export namespace Frontier {
  export interface JSON {
    [key: string]: json.JSON;
    scope: string;
    items: Array<Item.JSON>;
  }

  export function isFrontier(value: unknown): value is Frontier {
    return value instanceof Frontier;
  }
}

enum State {
  Waiting = "waiting",
  InProgress = "in-progress",
  Completed = "completed",
  Error = "error",
}

class Item implements Equatable, Serializable {
  public static of(url: string | URL): Item {
    return new Item(toURL(url), [], State.Waiting);
  }

  public static from(json: Item.JSON): Item {
    return new Item(
      toURL(json.url),
      json.aliases.map(toURL),
      json.state as State
    );
  }

  private _url: URL;
  private readonly _aliases: Array<URL>;
  private _state: State;

  private constructor(url: URL, aliases: Array<URL>, state: State) {
    this._url = url;
    this._aliases = aliases;
    this._state = state;
  }

  public get url(): URL {
    return this._url;
  }

  public get aliases(): Iterable<URL> {
    return this._aliases;
  }

  public get state(): State {
    return this._state;
  }

  public isWaiting(): boolean {
    return this._state === State.Waiting;
  }

  public isInProgress(): boolean {
    return this._state === State.InProgress;
  }

  public isCompleted(): boolean {
    return this._state === State.Completed;
  }

  public matches(url: string | URL): boolean {
    url = toURL(url);

    return this._url.equals(url) || this._aliases.some(equals(url));
  }

  public transition(state: State): boolean {
    switch (this._state) {
      case State.Waiting:
        if (state !== State.InProgress) {
          return false;
        } else break;

      case State.InProgress:
        if (state !== State.Completed && state !== State.Error) {
          return false;
        } else break;

      case State.Completed:
        return false;

      case State.Error:
        if (state !== State.Waiting) {
          return false;
        } else break;
    }

    this._state = state;

    return true;
  }

  public alias(url: string | URL): boolean {
    url = toURL(url);

    if (this._url.equals(url) || this._aliases.some(equals(url))) {
      return false;
    }

    this._aliases.push(url);

    return true;
  }

  public redirect(target: string | URL): boolean {
    target = toURL(target);

    if (this._url.equals(target)) {
      return false;
    }

    this._aliases.push(this._url);
    this._url = target;

    return true;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Item &&
      value._url.equals(this._url) &&
      value._aliases.length === this._aliases.length &&
      value._aliases.every((alias, i) => alias.equals(this._aliases[i])) &&
      value._state === this._state
    );
  }

  public toJSON(): Item.JSON {
    return {
      url: this._url.toString(),
      aliases: this._aliases.map((url) => url.toString()),
      state: this._state,
    };
  }
}

namespace Item {
  export interface JSON {
    [key: string]: json.JSON;
    url: string;
    aliases: Array<string>;
    state: string;
  }
}

function toURL(url: string | URL): URL {
  url = typeof url === "string" ? URL.parse(url).get() : url;
  return url.withoutFragment();
}

function isInScope(scope: string | URL, url: string | URL): boolean {
  return toURL(url).toString().startsWith(toURL(scope).toString());
}
