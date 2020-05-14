import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Decoder } from "@siteimprove/alfa-encoding";
import { Headers, Request, Response } from "@siteimprove/alfa-http";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { Result, Ok } from "@siteimprove/alfa-result";
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

  private readonly _browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this._browser = browser;
  }

  public async scrape(
    url: string | URL,
    options: Scraper.scrape.Options = {}
  ): Promise<Result<Page, string>> {
    const {
      timeout = Timeout.of(10000),
      awaiter = Awaiter.ready(),
      device = Device.standard(),
      credentials = null,
      screenshot = null,
      javascript = true,
    } = options;

    let page: puppeteer.Page | undefined;
    try {
      page = await this._browser.newPage();

      await page.emulateMediaType(
        device.type === Device.Type.Print ? "print" : "screen"
      );

      await page.setViewport({
        width: device.viewport.width,
        height: device.viewport.width,
        deviceScaleFactor: device.display.resolution,
        isLandscape: device.viewport.isLandscape(),
      });

      await page.authenticate(credentials);

      await page.setJavaScriptEnabled(javascript);

      let request: Request | null = null;
      let response: Response | null | Promise<Response | null> = null;

      // Origin is used to refer to the resource being scraped. While origin is
      // initially the resource at the URL passed to this method, origin may
      // change if the resource in question performs certain redirects.
      let origin = typeof url === "string" ? new URL(url) : url;

      page.on("response", (res) => {
        if (res.request().resourceType() !== "document") {
          return;
        }

        const destination = new URL(res.url());

        if (origin.href === destination.href) {
          const status = res.status();

          // If the response performs a redirect using 3xx status codes, parse
          // the location HTTP header and use that as the new origin.
          if (status >= 300 && status <= 399) {
            try {
              origin = new URL(res.headers().location);
            } catch {}
          } else {
            request = parseRequest(res.request());

            // As response handlers are not async, we have to assign the parsed
            // response as a promise and immediately register an error handler
            // to avoid an uncaught exception if parsing the response fails.
            response = parseResponse(res).catch((err) => null);
          }
        }
      });

      // Attempt navigating to the origin until we either have a parsed
      // request and response, or the timeout is reached.
      while (request === null || response === null) {
        page
          .goto(origin.href, {
            timeout: timeout.remaining(),
            waitUntil: "domcontentloaded",
          })
          .catch(() => {});

        const result = await awaiter(page, timeout.remaining());

        if (result.isErr()) {
          return result;
        }

        // Await parsing of the response, which may fail and result in a null
        // response. If this happens, we retry per the above.
        response = await response;
      }

      let document: Document | null = null;

      // Now that the page has successfully loaded, take a snapshot of the page
      // unless the page has navigated away from the origin.
      if (page.url() === origin.href) {
        try {
          document = await parseDocument(page);
        } catch {
          // Due to a race condition between Puppeteer and Chromium, the page
          // may be released due to navigation while script evaluation is in
          // progress. If this happens, we simply ignore it as it's beyond our
          // control.
        }
      }

      // If requested, take a screenshot of the page as it looks at the time of
      // snapshot. This can be a useful aid in debugging.
      if (screenshot !== null) {
        await takeScreenshot(page, screenshot);
      }

      // If the snapshot failed we instead take a snapshot directly of the
      // response body.
      if (document === null) {
        // Navigate to a blank page to ensure that we're not affected by the
        // race condition between Puppeteer and Chromium.
        await page.goto("about:blank");

        document = await parseDocument(page, (response as Response).body);
      }

      return Ok.of(Page.of(request, response, document, device));
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
      readonly javascript?: boolean;
    }
  }
}

function parseRequest(request: puppeteer.Request): Request {
  return Request.of(
    request.method(),
    request.url(),
    Headers.from(entries(request.headers()))
  );
}

async function parseResponse(response: puppeteer.Response): Promise<Response> {
  return Response.of(
    response.url(),
    response.status(),
    Headers.from(entries(response.headers())),
    response.ok() ? await response.buffer() : new ArrayBuffer(0)
  );
}

async function parseDocument(
  page: puppeteer.Page,
  html: ArrayBuffer | null = null
): Promise<Document> {
  const handle = await page.evaluateHandle(
    (html: string | null) => {
      if (html === null) {
        return window.document;
      }

      return new DOMParser().parseFromString(html, "text/html");
    },
    html === null ? null : Decoder.decode(new Uint8Array(html))
  );

  const { document } = await Puppeteer.asPage(handle);

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
