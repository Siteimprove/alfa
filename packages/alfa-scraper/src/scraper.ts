/// <reference lib="dom" />

import * as fs from "fs";

import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import {
  Cookie,
  Header,
  Headers,
  Request,
  Response,
} from "@siteimprove/alfa-http";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { Result, Err } from "@siteimprove/alfa-result";
import { Timeout } from "@siteimprove/alfa-time";
import { URL } from "@siteimprove/alfa-url";
import { Page } from "@siteimprove/alfa-web";

import * as puppeteer from "puppeteer";

import { Archive } from "./archive";
import { Awaiter } from "./awaiter";
import { Credentials } from "./credentials";
import { Screenshot } from "./screenshot";

const { entries } = Object;
const { ceil } = Math;

/**
 * @public
 */
export class Scraper {
  public static async of(
    browser: Promise<puppeteer.Browser> = puppeteer.launch({
      args: [
        "--no-sandbox",

        // In order to be able to access external style sheets through CSSOM, we
        // have to disable CORS restrictions in Chromium.
        "--disable-web-security",
      ],
    })
  ): Promise<Scraper> {
    return new Scraper(await browser);
  }

  public static async with<T>(
    mapper: Mapper<Scraper, Promise<T>>,
    browser?: Promise<puppeteer.Browser>
  ): Promise<T> {
    const scraper = await this.of(browser);

    try {
      return await mapper(scraper);
    } finally {
      await scraper.close();
    }
  }

  private readonly _browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this._browser = browser;
  }

  /**
   * Scrape the specified URL.
   */
  public async scrape(
    url: string | URL,
    options: Scraper.scrape.Options = {}
  ): Promise<Result<Page, string>> {
    if (typeof url === "string") {
      const result = URL.parse(url);

      if (result.isErr()) {
        return result;
      }

      url = result.get();
    }

    const scheme = url.scheme;

    const {
      timeout = Timeout.of(10000),
      awaiter = Awaiter.loaded(),
      device = Device.standard(),
      credentials = null,
      screenshot = null,
      archive = null,
      headers = [],
      cookies = [],
      fit = true,
    } = options;

    const {
      viewport,
      viewport: { width, height },
      display: { resolution },
      scripting,
    } = device;

    let page: puppeteer.Page | undefined;
    try {
      page = await this._browser.newPage();

      const client = await page.target().createCDPSession();

      await page.emulateMediaType(
        device.type === Device.Type.Print ? "print" : "screen"
      );

      // Puppeteer doesn't yet support all available media features and so might
      // throw if passed an unsupported feature. Catch these errors and pass
      // them on to the caller to deal with.
      try {
        await page.emulateMediaFeatures([
          ...Iterable.map(device.preferences, (preference) =>
            preference.toJSON()
          ),
        ]);
      } catch (err) {
        if (err instanceof Error) {
          return Err.of(err.message);
        } else {
          return Err.of(`${err}`);
        }
      }

      await page.setViewport({
        width,
        height,
        deviceScaleFactor: resolution,
        isLandscape: viewport.isLandscape(),
      });

      await page.setJavaScriptEnabled(scripting.enabled);

      if (credentials !== null) {
        await page.authenticate(credentials);
      }

      await page.setExtraHTTPHeaders(
        Iterable.reduce(
          headers,
          (headers, header) => {
            headers[header.name] = header.value;
            return headers;
          },
          {} as Record<string, string>
        )
      );

      if (scheme === "http" || scheme === "https") {
        await page.setCookie(
          ...Iterable.map(cookies, (cookie) => {
            return {
              name: cookie.name,
              value: cookie.value,
              url: url.toString(),
            };
          })
        );
      }

      let origin = url.toString();

      while (true) {
        try {
          // Navigate to the origin with what remains of the timeout. We wait
          // for the `DOMContentLoaded` event as this is the earliest stage at
          // which Puppeteer will consider the page loaded.
          const response = page.goto(origin, {
            timeout: timeout.remaining(),
            waitUntil: "domcontentloaded",
          });

          // Grab the request from the resulting response as soon as possible.
          // In event of navigation away from the origin, such as redirects, the
          // response context will be destroyed. If we attempt to grab the
          // request after this, things will go haywire.
          const request = response.then((response) => response.request());

          // When the response has settled, fit the viewport to the contents of
          // the page if requested to do so. This is done by requesting the
          // layout metrics of the page and setting the viewport accordingly.
          const resize = response.then(async () => {
            if (fit) {
              const {
                contentSize: { width, height },
              } = await client.send("Page.getLayoutMetrics");

              await page?.setViewport({
                width: ceil(width),
                height: ceil(height),
              });
            }
          });

          const load = awaiter(page, timeout);

          // Await both the response, request, and resize promise at the same
          // time to avoid any exceptions being dropped on the floor. At the
          // very least, we need all of these settled before we parse the
          // document.
          await Promise.all([response, request, resize]);

          for (const error of await load) {
            return Err.of(error);
          }

          const document = await parseDocument(page);

          if (screenshot !== null) {
            await captureScreenshot(page, screenshot);
          }

          if (archive !== null) {
            await captureArchive(client, archive);
          }

          return Result.of(
            Page.of(
              parseRequest(await request),
              await parseResponse(await response),
              document,
              device
            )
          );
        } catch (err) {
          // If the timeout was exceeded while navigating to the page, bail out
          // with an error.
          if (err instanceof Error && err.name === "TimeoutError") {
            return Err.of(`Timeout exceeded while navigating to the page`);
          }

          // Otherwise, attempt to navigate to the page again, changing its
          // origin in case a redirect was performed.
          else {
            origin = page.url();
          }
        }
      }
    } finally {
      if (page !== undefined) {
        await page.close();
      }
    }
  }

  /**
   * Close the scraper and its associated browser.
   */
  public async close(): Promise<void> {
    await this._browser.close();
  }
}

/**
 * @public
 */
export namespace Scraper {
  export namespace scrape {
    export interface Options {
      readonly timeout?: Timeout;
      readonly awaiter?: Awaiter;
      readonly device?: Device;
      readonly credentials?: Credentials;
      readonly screenshot?: Screenshot;
      readonly archive?: Archive;
      readonly headers?: Iterable<Header>;
      readonly cookies?: Iterable<Cookie>;
      readonly fit?: boolean;
    }
  }
}

function parseRequest(request: puppeteer.HTTPRequest): Request {
  return Request.of(
    request.method(),
    URL.parse(request.url()).get(),
    Headers.of(
      entries(request.headers()).map(([name, value]) => Header.of(name, value))
    )
  );
}

async function parseResponse(
  response: puppeteer.HTTPResponse
): Promise<Response> {
  return Response.of(
    URL.parse(response.url()).get(),
    response.status(),
    Headers.of(
      entries(response.headers()).map(([name, value]) => Header.of(name, value))
    ),
    response.ok() ? await response.buffer() : new ArrayBuffer(0)
  );
}

async function parseDocument(page: puppeteer.Page): Promise<Document> {
  const { document } = await Puppeteer.toPage(
    await page.evaluateHandle(() => window.document)
  );

  return document;
}

async function captureScreenshot(
  page: puppeteer.Page,
  screenshot: Screenshot
): Promise<void> {
  switch (screenshot.type.type) {
    case "png":
      await page.screenshot({
        path: screenshot.path,
        type: "png",
        omitBackground: !screenshot.type.background,
        fullPage: true,
        encoding: "binary",
      });
      break;

    case "jpeg":
      await page.screenshot({
        path: screenshot.path,
        type: "jpeg",
        quality: screenshot.type.quality,
        fullPage: true,
        encoding: "binary",
      });
  }
}

async function captureArchive(
  client: puppeteer.CDPSession,
  archive: Archive
): Promise<void> {
  switch (archive.format) {
    case Archive.Format.MHTML: {
      const { data } = await client.send("Page.captureSnapshot", {
        format: "mhtml",
      });

      await new Promise<void>((resolve, reject) =>
        fs.writeFile(archive.path, data, "utf-8", (err) =>
          err ? reject(err) : resolve()
        )
      );
    }
  }
}
