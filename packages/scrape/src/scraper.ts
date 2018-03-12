import { launch } from "puppeteer";
import { Node, Element, traverse, isElement } from "@alfa/dom";
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
}>;

export class Scraper {
  private readonly _browser = launch({
    headless: true
  });

  private readonly _pickle = bundle(PICKLE, {
    builtins: false,
    plugin: ["tinyify"]
  });

  async scrape(url: string, options: ScrapeOptions = {}): Promise<Aspects> {
    const browser = await this._browser;
    const pickle = await this._pickle;

    const page = await browser.newPage();
    await page.goto(url, {
      timeout: options.timeout || 10000,
      waitUntil: options.wait || Wait.Loaded
    });

    const document = await page.evaluate(`{
      const require = ${pickle};
      const { pickle } = require("${PICKLE}");
      pickle();
    }`);

    parentize(document);

    await page.close();

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
