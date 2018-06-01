import { launch } from "puppeteer";
import { Document } from "@siteimprove/alfa-dom";
import { bundle } from "./bundle";

const Virtualize = require.resolve("./virtualize");

export enum Wait {
  Ready = "domcontentloaded",
  Loaded = "load",
  Idle = "networkidle0"
}

export type ScrapeOptions = Readonly<{
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
}>;

export class Scraper {
  private readonly _browser = launch({
    headless: true,
    args: ["--disable-web-security"]
  });

  private readonly _virtualize = bundle(Virtualize, {
    builtins: false
  });

  async scrape(
    url: string,
    options: ScrapeOptions = {}
  ): Promise<{ document: Document }> {
    const browser = await this._browser;
    const virtualize = await this._virtualize;

    const page = await browser.newPage();

    const {
      viewport = { width: 1280, height: 720 },
      credentials = null
    } = options;

    await page.setViewport({
      width: viewport.width,
      height: viewport.width,
      deviceScaleFactor: viewport.scale || 1
    });

    await page.authenticate(credentials);

    const wait = options.wait || Wait.Loaded;
    const timeout = options.timeout || 10000;

    const start = Date.now();

    try {
      await page.goto(url, { timeout, waitUntil: wait });
    } catch (err) {
      await page.close();
      throw err;
    }

    let document: Document | null = null;
    let error: Error | null = null;
    do {
      const elapsed = Date.now() - start;

      if (elapsed > timeout) {
        break;
      }

      try {
        document = await page.evaluate(`{
          const require = ${virtualize};
          const { virtualize } = require("${Virtualize}");
          virtualize(window.document);
        }`);
      } catch (err) {
        error = err;

        // If evaluation fails, this could indicate that a client side redirect
        // was performed. If so, we should now be on the correct domain; reload
        // the page using whatever is left of the timeout and try again.
        try {
          await page.reload({ timeout: timeout - elapsed, waitUntil: wait });
        } catch (err) {}
      }
    } while (document === null);

    await page.close();

    if (document === null) {
      throw error || new Error("Failed to scrape document");
    }

    return { document };
  }

  async close(): Promise<void> {
    const browser = await this._browser;
    await browser.close();
  }
}
