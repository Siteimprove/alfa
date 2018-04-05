import { launch } from "puppeteer";
import { parse } from "circular-json";
import { Aspects } from "@alfa/act";
import { bundle } from "./bundle";

const PICKLE = require.resolve("./pickle");

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
    headless: false
  });

  private readonly _pickle = bundle(PICKLE, {
    builtins: false,
    plugin: [require("tinyify")]
  });

  async scrape(url: string, options: ScrapeOptions = {}): Promise<Aspects> {
    const browser = await this._browser;
    const pickle = await this._pickle;

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

    let aspects: Aspects | null = null;
    let error: Error | null = null;
    do {
      const elapsed = Date.now() - start;

      if (elapsed > timeout) {
        break;
      }

      try {
        aspects = parse(
          await page.evaluate(`{
            const require = ${pickle};
            const { pickle } = require("${PICKLE}");
            pickle();
          }`)
        );
      } catch (err) {
        error = err;

        // If evaluation fails, this could indicate that a client side redirect
        // was performed. If so, we should now be on the correct domain; reload
        // the page using whatever is left of the timeout and try again.
        try {
          await page.reload({ timeout: timeout - elapsed, waitUntil: wait });
        } catch (err) {}
      }
    } while (aspects === null);

    await page.close();

    if (aspects === null) {
      throw error || new Error("Failed to scrape document");
    }

    return aspects;
  }

  async close(): Promise<void> {
    const browser = await this._browser;
    await browser.close();
  }
}
