import { Aspects } from "@siteimprove/alfa-act";
import { Device, DeviceType, Orientation } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-util";
import { readFileSync } from "fs";
import * as puppeteer from "puppeteer";

const virtualize = `{
  ${readFileSync(require.resolve("./virtualize"), "utf8")};
  virtualizeNode(window.document);
}`;

export const enum Wait {
  Ready = "domcontentloaded",
  Loaded = "load",
  Idle = "networkidle0"
}

export interface ScrapeOptions {
  readonly timeout?: number;
  readonly wait?: Wait;
  readonly viewport?: {
    readonly width: number;
    readonly height: number;
    readonly scale?: number;
  };
  readonly credentials?: {
    readonly username: string;
    readonly password: string;
  };
}

export class Scraper {
  private readonly browser = puppeteer.launch({
    args: [
      "--no-sandbox",

      // In order to be able to access external style sheets through CSSOM, we
      // have to disable CORS restrictions in Chromium.
      "--disable-web-security"
    ]
  });

  public async scrape(
    url: string | URL,
    options: ScrapeOptions = {}
  ): Promise<Aspects> {
    const {
      viewport = { width: 1280, height: 720, scale: 1 },
      credentials = null,
      wait = Wait.Loaded,
      timeout = 10000
    } = options;

    const device: Device = {
      type: DeviceType.Screen,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        orientation: Orientation.Landscape
      },
      display: {
        resolution: viewport.scale === undefined ? 1 : viewport.scale
      }
    };

    const browser = await this.browser;
    const page = await browser.newPage();

    await page.setViewport({
      width: viewport.width,
      height: viewport.width,
      deviceScaleFactor: viewport.scale
    });

    await page.authenticate(credentials);

    let request: Request | null = null;
    let response: Response | null = null;
    let document: Document | null = null;

    // Origin is used to refer to the resource being scraped. While origin is
    // initially the resource at the URL passed to this method, origin may
    // change if the resource in question performs certain redirects.
    let origin = typeof url === "string" ? new URL(url) : url;

    let settle: Promise<void> | null = null;

    page.on("response", async res => {
      const destination = new URL(res.url());

      // If the response is the result of a navigation request and performs a
      // redirect using 3xx status codes, parse the location HTTP header and use
      // that as the new origin.
      if (
        res.request().isNavigationRequest() &&
        res.status() >= 300 &&
        res.status() <= 399
      ) {
        try {
          origin = new URL(res.headers().location);
        } catch (err) {}
      }

      // Otherwise, if the response is the origin, parse the response and its
      // request. Also parse the document for use as a prelimary snapshot of the
      // page.
      else if (origin.href === destination.href) {
        let done = () => {};

        settle = new Promise(resolve => (done = resolve));

        try {
          response = await parseResponse(res);
          request = await parseRequest(res.request());
          document = await parseDocument(page);
        } catch (err) {}

        done();
      }
    });

    const start = Date.now();

    try {
      await page.goto(origin.href, { timeout, waitUntil: wait });

      // If either the request, response, or preliminary document snapshot is
      // missing, this could indicate that the page context was released before
      // the response or document could be parsed. Reload the page using
      // whatever is left of the timeout and try again.
      while (request === null || response === null || document === null) {
        if (settle !== null) {
          await settle;
        }

        await page.reload({
          timeout: timeout - (Date.now() - start),
          waitUntil: wait
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        switch (err.name) {
          case "TimeoutError":
            throw new Error(`Navigation timeout of ${timeout}ms exceeded`);
        }
      }

      throw err;
    }

    // Now that the page has successfully loaded and a preliminary snapshot
    // constructed, attempt to take an additional snapshot of the page unless
    // the page has navigated away from the origin.
    if (page.url() === origin.href) {
      try {
        document = await parseDocument(page);
      } catch (err) {}
    }

    return { request, response, document, device };
  }

  public async close(): Promise<void> {
    await (await this.browser).close();
  }
}

async function parseRequest(request: puppeteer.Request): Promise<Request> {
  return {
    method: request.method(),
    url: request.url(),
    headers: request.headers()
  };
}

async function parseResponse(response: puppeteer.Response): Promise<Response> {
  return {
    status: response.status(),
    headers: response.headers(),
    body: response.ok() ? await response.text() : ""
  };
}

async function parseDocument(page: puppeteer.Page): Promise<Document> {
  return (await page.evaluate(virtualize)) as Document;
}
