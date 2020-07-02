import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import {
  Cookie,
  Header,
  Headers,
  Request,
  Response,
} from "@siteimprove/alfa-http";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { Result, Ok, Err } from "@siteimprove/alfa-result";
import { Timeout } from "@siteimprove/alfa-time";
import { Page } from "@siteimprove/alfa-web";

import * as puppeteer from "puppeteer";

import { Awaiter } from "./awaiter";
import { Credentials } from "./credentials";
import { Screenshot } from "./screenshot";

const { entries } = Object;

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
    const result = await mapper(scraper);

    await scraper.close();
    return result;
  }

  private readonly _browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this._browser = browser;
  }

  public async scrape(
    url: string | URL,
    options: Scraper.scrape.Options = {}
  ): Promise<Result<Page, string>> {
    const { href, protocol } = typeof url === "string" ? new URL(url) : url;

    const {
      timeout = Timeout.of(10000),
      awaiter = Awaiter.loaded(),
      device = Device.standard(),
      credentials = null,
      screenshot = null,
      headers = [],
      cookies = [],
    } = options;

    let page: puppeteer.Page | undefined;
    try {
      page = await this._browser.newPage();

      await page.emulateMediaType(
        device.type === Device.Type.Print ? "print" : "screen"
      );

      // Puppeteer doesn't yet support all available media features and so might
      // throw if passed an unsupported feature. Catch these errors and pass
      // them on to the caller to deal with.
      try {
        await page.emulateMediaFeatures(
          [...device.preferences].map((preference) => preference.toJSON())
        );
      } catch (err) {
        return Err.of(err.message);
      }

      await page.setViewport({
        width: device.viewport.width,
        height: device.viewport.width,
        deviceScaleFactor: device.display.resolution,
        isLandscape: device.viewport.isLandscape(),
      });

      await page.setJavaScriptEnabled(device.scripting.enabled);

      await page.authenticate(credentials);

      await page.setExtraHTTPHeaders(
        [...headers].reduce<Record<string, string>>((headers, header) => {
          headers[header.name] = header.value;
          return headers;
        }, {})
      );

      if (protocol === "http:" || protocol === "https:") {
        await page.setCookie(
          ...[...cookies].map((cookie) => {
            return {
              name: cookie.name,
              value: cookie.value,
              url: href,
            };
          })
        );
      }

      let origin = href;

      while (true) {
        try {
          const response = page
            .goto(origin, { timeout: timeout.remaining() })
            .catch(() => null)
            .then((response) => response!);

          const request = response.then((response) => response.request());

          const result = await awaiter(page, timeout);

          if (result.isErr()) {
            return result;
          }

          const document = await parseDocument(page);

          if (screenshot !== null) {
            await takeScreenshot(page, screenshot);
          }

          return Ok.of(
            Page.of(
              parseRequest(await request),
              await parseResponse(await response),
              document,
              device
            )
          );
        } catch {
          origin = page.url();
        }
      }
    } finally {
      if (page !== undefined) {
        await page.close();
      }
    }
  }

  public async close(): Promise<void> {
    await this._browser.close();
  }
}

export namespace Scraper {
  export namespace scrape {
    export interface Options {
      readonly timeout?: Timeout;
      readonly awaiter?: Awaiter;
      readonly device?: Device;
      readonly credentials?: Credentials;
      readonly screenshot?: Screenshot;
      readonly headers?: Iterable<Header>;
      readonly cookies?: Iterable<Cookie>;
    }
  }
}

function parseRequest(request: puppeteer.Request): Request {
  return Request.of(
    request.method(),
    request.url(),
    Headers.of(
      entries(request.headers()).map(([name, value]) => Header.of(name, value))
    )
  );
}

async function parseResponse(response: puppeteer.Response): Promise<Response> {
  return Response.of(
    response.url(),
    response.status(),
    Headers.of(
      entries(response.headers()).map(([name, value]) => Header.of(name, value))
    ),
    response.ok() ? await response.buffer() : new ArrayBuffer(0)
  );
}

async function parseDocument(page: puppeteer.Page): Promise<Document> {
  const { document } = await Puppeteer.asPage(
    await page.evaluateHandle(() => window.document)
  );

  return document;
}

async function takeScreenshot(
  page: puppeteer.Page,
  screenshot: Screenshot
): Promise<Buffer> {
  switch (screenshot.type.type) {
    case "png":
      return page.screenshot({
        path: screenshot.path,
        type: "png",
        omitBackground: !screenshot.type.background,
        fullPage: true,
      });

    case "jpeg":
      return page.screenshot({
        path: screenshot.path,
        type: "jpeg",
        quality: screenshot.type.quality,
        fullPage: true,
      });
  }
}
