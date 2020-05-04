import { Result, Ok, Err } from "@siteimprove/alfa-result";

import * as puppeteer from "puppeteer";

export type Awaiter<T = unknown> = (
  page: puppeteer.Page,
  timeout: number
) => Promise<Result<T, string>>;

export namespace Awaiter {
  export function ready(): Awaiter<puppeteer.Response> {
    return async (page, timeout) => {
      try {
        return Ok.of(
          await page.waitForNavigation({
            waitUntil: "domcontentloaded",
            timeout,
          })
        );
      } catch {
        return Err.of(
          `Timeout exceeded while waiting for the document to be ready`
        );
      }
    };
  }

  export function loaded(): Awaiter<puppeteer.Response> {
    return async (page, timeout) => {
      try {
        return Ok.of(
          await page.waitForNavigation({ waitUntil: "load", timeout })
        );
      } catch {
        return Err.of(
          `Timeout exceeded while waiting for the document to load`
        );
      }
    };
  }

  export function idle(): Awaiter<puppeteer.Response> {
    return async (page, timeout) => {
      try {
        return Ok.of(
          await page.waitForNavigation({ waitUntil: "networkidle0", timeout })
        );
      } catch {
        return Err.of(
          `Timeout exceeded while waiting for the network to be idle`
        );
      }
    };
  }

  export function duration(
    duration: number,
    after: Awaiter<puppeteer.Response> = loaded()
  ): Awaiter<puppeteer.Response> {
    return async (page, timeout) => {
      const result = await after(page, timeout);

      if (result.isOk()) {
        await page.waitFor(duration);
      }

      return result;
    };
  }

  export function selector(
    selector: string
  ): Awaiter<puppeteer.ElementHandle<Element>> {
    return async (page, timeout) => {
      try {
        return Ok.of(await page.waitForSelector(selector, { timeout }));
      } catch {
        return Err.of(
          `Timeout exceeded while waiting for the selector "${selector}"`
        );
      }
    };
  }

  export function xpath(
    expression: string
  ): Awaiter<puppeteer.ElementHandle<Element>> {
    return async (page, timeout) => {
      try {
        return Ok.of(await page.waitForXPath(expression, { timeout }));
      } catch {
        return Err.of(
          `Timeout exceeded while waiting for the expression "${selector}"`
        );
      }
    };
  }
}
