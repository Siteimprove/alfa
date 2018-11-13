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

export interface ScrapeResult {
  readonly request: Request;
  readonly response: Response;
  readonly document: Document;
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
  ): Promise<ScrapeResult> {
    const origin = typeof url === "string" ? new URL(url) : url;

    const {
      viewport = { width: 1280, height: 720, scale: 1 },
      credentials = null,
      wait = Wait.Loaded,
      timeout = 10000
    } = options;

    const browser = await this.browser;
    const page = await browser.newPage();

    await page.setViewport({
      width: viewport.width,
      height: viewport.width,
      deviceScaleFactor: viewport.scale
    });

    await page.setRequestInterception(true);

    await page.authenticate(credentials);

    let request: Promise<Request> | Request | null = null;
    let response: Promise<Response> | Response | null = null;
    let document: Promise<Document> | Document | null = null;

    page.on("request", async req => {
      const destination = new URL(req.url());

      // If requesting the URL currently being scraped, we parse and store the
      // request as this is the one we're looking for.
      if (origin.href === destination.href) {
        request = parseRequest(req);

        await request;

        req.continue();
      }

      // Otherwise, if this is a navigation request, we have to abort it as we
      // would otherwise be navigating away from the page being scraped.
      else if (req.isNavigationRequest()) {
        // Wait for the response from the previous request to finish parsing.
        // Since the current request is a navigation request, the response from
        // the previous request will be disposed as soon as the current request
        // resolves.
        await response;

        // Abort the request once the response from the previous request has
        // been parsed.
        req.abort();
      }

      // Otherwise, continue the request normally.
      else {
        req.continue();
      }
    });

    page.on("response", async res => {
      const destination = new URL(res.url());

      if (origin.href === destination.href) {
        response = parseResponse(res);

        await response;

        document = parseDocument(page);
      }
    });

    await page.goto(origin.href, { timeout, waitUntil: wait });

    request = await request!;
    response = await response!;

    try {
      document = await document!;
    } catch (err) {
      // If the initial snapshot of the document fails, is means that the page
      // already navigated away. Clean up and abort.
      await page.close();
      throw err;
    }

    try {
      document = await parseDocument(page);
    } catch (err) {
      // We can therefore safely ignore the error as we have the initial
      // snapshot of the document.
    }

    return {
      request,
      response,
      document
    };
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
  const document = await page.evaluate(virtualize);
  return document as Document;
}
