import { Device, Display, Viewport } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Decoder } from "@siteimprove/alfa-encoding";
import { Headers, Request, Response } from "@siteimprove/alfa-http";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { Page } from "@siteimprove/alfa-web";

import * as puppeteer from "puppeteer";

const { entries } = Object;

export class Scraper {
  public static async of(
    browser: Promise<puppeteer.Browser> = puppeteer.launch({
      args: [
        "--no-sandbox",

        // In order to be able to access external style sheets through CSSOM, we
        // have to disable CORS restrictions in Chromium.
        "--disable-web-security"
      ]
    })
  ): Promise<Scraper> {
    return new Scraper(await browser);
  }

  private readonly browser: puppeteer.Browser;

  private constructor(browser: puppeteer.Browser) {
    this.browser = browser;
  }

  public async scrape(
    url: string | URL,
    options: Scraper.scrape.Options = {}
  ): Promise<Page> {
    const {
      wait = Scraper.Wait.Loaded,
      timeout = 10000,
      viewport = Viewport.standard(),
      display = Display.standard(),
      credentials = null
    } = options;

    const device = Device.of(Device.Type.Screen, viewport, display);

    const page = await this.browser.newPage();

    await page.setViewport({
      width: viewport.width,
      height: viewport.width,
      deviceScaleFactor: display.resolution,
      isLandscape: viewport.orientation === Viewport.Orientation.Landscape
    });

    await page.authenticate(credentials);

    let request: Request | null = null;
    let response: Response | null | Promise<Response | null> = null;

    // Origin is used to refer to the resource being scraped. While origin is
    // initially the resource at the URL passed to this method, origin may
    // change if the resource in question performs certain redirects.
    let origin = typeof url === "string" ? new URL(url) : url;

    page.on("response", res => {
      if (res.request().resourceType() !== "document") {
        return;
      }

      const destination = new URL(res.url());

      if (origin.href === destination.href) {
        const status = res.status();

        // If the response performs a redirect using 3xx status codes, parse the
        // location HTTP header and use that as the new origin.
        if (status >= 300 && status <= 399) {
          try {
            origin = new URL(res.headers().location);
          } catch (err) {}
        } else {
          request = parseRequest(res.request());

          // As response handlers are not async, we have to assign the parsed
          // response as a promise and immediately register an error handler to
          // avoid an uncaugt exception if parsing the response fails.
          response = parseResponse(res).catch(err => null);
        }
      }
    });

    const start = Date.now();

    try {
      // Attempt navigating to the origin until we either have a parsed request
      // and response, or the timeout is reached.
      while (request === null || response === null) {
        await page.goto(origin.href, {
          timeout: timeout - (Date.now() - start),
          waitUntil: wait
        });

        // Await parsing of the response, which may fail and result in a null
        // response. If this happens, we retry per the above.
        response = await response;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        err.message = `Navigation Timeout Exceeded: ${timeout}ms exceeded`;
      }

      throw err;
    }

    let document: Document | null = null;

    // Now that the page has successfully loaded, take a snapshot of the page
    // unless the page has navigated away from the origin.
    if (page.url() === origin.href) {
      try {
        document = await parseDocument(page);
      } catch (err) {
        // Due to a race condition between Puppeteer and Chromium, the page may
        // be released due to navigation while script evaluation is in progress.
        // If this happens, we simply ignore it as it's beyond our control.
      }
    }

    // If the snapshot failed we instead take a snapshot directly of the
    // response body.
    if (document === null) {
      // Navigate to a blank page to ensure that we're not affected by the race
      // condition between Puppeteer and Chromium.
      await page.goto("about:blank");

      document = await parseDocument(page, (response as Response).body);
    }

    return Page.of(request, response, document, device);
  }

  public async close(): Promise<void> {
    await this.browser.close();
  }
}

export namespace Scraper {
  export enum Wait {
    Ready = "domcontentloaded",
    Loaded = "load",
    Idle = "networkidle0"
  }

  export namespace scrape {
    export interface Options {
      readonly timeout?: number;
      readonly wait?: Wait;
      readonly viewport?: Viewport;
      readonly display?: Display;
      readonly credentials?: {
        readonly username: string;
        readonly password: string;
      };
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

      const parser = new DOMParser();

      return parser.parseFromString(html, "text/html");
    },
    html === null ? null : Decoder.decode(new Uint8Array(html))
  );

  const { document } = await Puppeteer.asPage(handle);

  return document;
}
