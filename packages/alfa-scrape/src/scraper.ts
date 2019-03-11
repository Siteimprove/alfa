import { Aspects } from "@siteimprove/alfa-act";
import { Device, DeviceType, Orientation } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-util";
import { readFileSync } from "fs";
import * as puppeteer from "puppeteer";

const virtualize = readFileSync(require.resolve("./virtualize"), "utf8");

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
    readonly landscape?: boolean;
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
      viewport = { width: 1280, height: 720, scale: 1, landscape: true },
      credentials = null,
      wait = Wait.Loaded,
      timeout = 10000
    } = options;

    const device: Device = {
      type: DeviceType.Screen,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        orientation:
          viewport.landscape !== false
            ? Orientation.Landscape
            : Orientation.Portrait
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
      deviceScaleFactor: viewport.scale,
      isLandscape: viewport.landscape
    });

    await page.authenticate(credentials);

    let request: Request | null = null;
    let response: Response | null | Promise<Response | null> = null;

    // Origin is used to refer to the resource being scraped. While origin is
    // initially the resource at the URL passed to this method, origin may
    // change if the resource in question performs certain redirects.
    let origin = typeof url === "string" ? new URL(url) : url;

    page.on("response", res => {
      const destination = new URL(res.url());

      if (origin.href === destination.href) {
        const status = res.status();

        // If the response is performs a redirect using 3xx status codes, parse
        // the location HTTP header and use that as the new origin.
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
      // and response or the timeout is reached.
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
      if (err instanceof Error) {
        switch (err.name) {
          case "TimeoutError":
            throw new Error(`Navigation timeout of ${timeout}ms exceeded`);
        }
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

    return { request, response, document, device };
  }

  public async close(): Promise<void> {
    await (await this.browser).close();
  }
}

function parseRequest(request: puppeteer.Request): Request {
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

async function parseDocument(
  page: puppeteer.Page,
  html?: string
): Promise<Document> {
  html = JSON.stringify(html);

  const snapshot = `{
    ${virtualize};
    const document = ${
      html === undefined
        ? "window.document"
        : `new DOMParser().parseFromString(${html}, "text/html");`
    }
    virtualizeNode(document);
  }`;

  return (await page.evaluate(snapshot)) as Document;
}
