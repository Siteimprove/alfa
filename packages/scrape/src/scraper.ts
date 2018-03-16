import { launch } from "puppeteer";
import { Node, Element, Document, traverse, isElement } from "@alfa/dom";
import { Aspects } from "@alfa/rule";
import { Style, State } from "@alfa/style";
import { Layout } from "@alfa/layout";
import { parentize, hasLayout, hasStyle } from "@alfa/pickle";
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
}>;

export class Scraper {
  private readonly _browser = launch({
    headless: true
  });

  private readonly _pickle = bundle(PICKLE, {
    builtins: false,
    plugin: [require("tinyify")]
  });

  async scrape(url: string, options: ScrapeOptions = {}): Promise<Aspects> {
    const browser = await this._browser;
    const pickle = await this._pickle;

    const page = await browser.newPage();

    if (options.viewport) {
      page.setViewport({
        width: options.viewport.width,
        height: options.viewport.width,
        deviceScaleFactor: options.viewport.scale || 1
      });
    }

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
          const require = ${pickle};
          const { pickle } = require("${PICKLE}");
          pickle();
        }`);
      } catch (err) {
        error = err;

        try {
          await page.reload({ timeout: timeout - elapsed, waitUntil: wait });
        } catch (err) {}
      }
    } while (document === null);

    await page.close();

    if (document === null) {
      throw error || new Error("Failed to scrape document");
    }

    parentize(document);

    const style: Map<Element, { [S in State]: Style }> = new Map();
    const layout: Map<Element, Layout> = new Map();

    traverse(document, node => {
      if (isElement(node)) {
        if (hasStyle(node)) {
          style.set(node, node.style);
        }

        if (hasLayout(node)) {
          layout.set(node, node.layout);
        }
      }
    });

    return { document, style, layout };
  }

  async close(): Promise<void> {
    const browser = await this._browser;
    await browser.close();
  }
}
