/// <reference lib="dom" />

import { Array } from "@siteimprove/alfa-array";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Promise } from "@siteimprove/alfa-promise";
import { Timeout } from "@siteimprove/alfa-time";

import { Page } from "puppeteer";

/**
 * @public
 */
export type Awaiter = (page: Page, timeout: Timeout) => Promise<Option<string>>;

/**
 * @public
 */
export namespace Awaiter {
  /**
   * Wait for any of the given awaiters.
   */
  export function any(awaiters: Iterable<Awaiter>): Awaiter {
    return async (page, timeout) =>
      Promise.any(
        ...Iterable.map(awaiters, (awaiter) => awaiter(page, timeout))
      );
  }

  /**
   * Wait for all of the given awaiters.
   */
  export function all(awaiters: Iterable<Awaiter>): Awaiter {
    return async (page, timeout) =>
      Promise.all(
        ...Iterable.map(awaiters, (awaiter) => awaiter(page, timeout))
      ).then((errors) => Array.collectFirst(errors, (error) => error));
  }

  /**
   * Wait for the `DOMContentLoaded` event to fire.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event}
   */
  export function ready(): Awaiter {
    return async (page, timeout) => {
      try {
        await page.waitForNavigation({
          waitUntil: "domcontentloaded",
          timeout: timeout.remaining(),
        });

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for the document to be ready`
        );
      }
    };
  }

  /**
   * Wait for the `load` event.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event}
   */
  export function loaded(): Awaiter {
    return async (page, timeout) => {
      try {
        await page.waitForNavigation({
          waitUntil: "load",
          timeout: timeout.remaining(),
        });

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for the document to load`
        );
      }
    };
  }

  /**
   * Wait for the network to be idle, i.e. have no requests inflight.
   */
  export function idle(): Awaiter {
    return async (page, timeout) => {
      try {
        await page.waitForNavigation({
          waitUntil: "networkidle0",
          timeout: timeout.remaining(),
        });

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for the network to be idle`
        );
      }
    };
  }

  /**
   * Wait for a fixed duration after another awaiter has finished.
   */
  export function duration(
    duration: number,
    after: Awaiter = loaded()
  ): Awaiter {
    return async (page, timeout) => {
      const error = await after(page, timeout);

      if (error.isNone()) {
        await page.waitForTimeout(duration);
      }

      return error;
    };
  }

  /**
   * Wait for an element matching the given selector to be present and visible.
   */
  export function selector(selector: string): Awaiter {
    return async (page, timeout) => {
      try {
        await page.waitForSelector(selector, {
          timeout: timeout.remaining(),
        });

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for the selector "${selector}"`
        );
      }
    };
  }

  /**
   * Wait for an element matching the given expression to be present and visible.
   */
  export function xpath(expression: string): Awaiter {
    return async (page, timeout) => {
      try {
        await page.waitForXPath(expression, {
          timeout: timeout.remaining(),
        });

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for the expression "${selector}"`
        );
      }
    };
  }

  /**
   * Wait for all animations to end after another awaiter has finished.
   *
   * @remarks
   * For animations that loop infinitely, this awaiter will never resolve.
   */
  export function animations(after: Awaiter = loaded()): Awaiter {
    return async (page, timeout) => {
      try {
        const error = await after(page, timeout);

        if (error.isSome()) {
          return error;
        }

        await page.waitForFunction(
          () =>
            document
              .getAnimations()
              .every((animation) => animation.playState !== "running"),
          {
            timeout: timeout.remaining(),
          }
        );

        return None;
      } catch {
        return Option.of(
          `Timeout exceeded while waiting for animations to end`
        );
      }
    };
  }
}
