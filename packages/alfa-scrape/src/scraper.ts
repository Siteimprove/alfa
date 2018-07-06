import { Document } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { readFileSync } from "fs";
import * as puppeteer from "puppeteer";

const virtualize = readFileSync(require.resolve("./virtualize"), "utf8");

export const enum Wait {
  Ready = "domcontentloaded",
  Loaded = "load",
  Idle = "networkidle0"
}

export class Scraper {
  private readonly browser = puppeteer.launch({
    args: [
      // In order to be able to access external style sheets through CSSOM, we
      // have to disable CORS restrictions in Chromium.
      "--disable-web-security"
    ]
  });

  public async scrape(
    url: string,
    options: Readonly<{
      timeout?: number;
      wait?: Wait;
      viewport?: Readonly<{
        width: number;
        height: number;
        scale?: number;
      }>;
      credentials?: Readonly<{
        username: string;
        password: string;
      }>;
    }> = {}
  ): Promise<{ request: Request; response: Response; document: Document }> {
    const page = await (await this.browser).newPage();

    const {
      viewport = { width: 1280, height: 720, scale: 1 },
      credentials = null,
      wait = Wait.Loaded,
      timeout = 10000
    } = options;

    await page.setViewport({
      width: viewport.width,
      height: viewport.width,
      deviceScaleFactor: viewport.scale
    });

    await page.authenticate(credentials);

    const start = Date.now();

    let response: puppeteer.Response | null = null;
    try {
      response = await page.goto(url, { timeout, waitUntil: wait });
    } catch (err) {
      await page.close();
      throw err;
    }

    let document: Document | null = null;
    let error: Error | null = null;
    do {
      const elapsed = Date.now() - start;

      if (elapsed > timeout) {
        await page.close();
        break;
      }

      try {
        document = (await page.evaluate(`{
          ${virtualize};
          virtualizeNode(window.document);
        }`)) as Document;
      } catch (err) {
        error = err as Error;

        // If evaluation fails, this could indicate that a client side redirect
        // was performed. If so, we should now be on the correct domain; reload
        // the page using whatever is left of the timeout and try again.
        try {
          response = await page.reload({
            timeout: timeout - elapsed,
            waitUntil: wait
          });
        } catch (err) {
          error = err as Error;
        }
      }
    } while (document === null);

    if (document === null || response === null) {
      throw error === null ? new Error("Failed to scrape document") : error;
    }

    const result = {
      request: await parseRequest(response.request()),
      response: await parseResponse(response),
      document
    };

    await page.close();

    return result;
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
    body: await response.text()
  };
}
