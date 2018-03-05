import { launch } from "puppeteer";
import * as browserify from "browserify";
import { Node, Element, traverse, isElement } from "@alfa/dom";
import { Aspects } from "@alfa/rule";
import { Style, State } from "@alfa/style";
import { Layout } from "@alfa/layout";
import * as Pickle from "@alfa/pickle";

const PICKLE = require.resolve("@alfa/pickle");

const { parentize, hasStyle, hasLayout } = Pickle;

function bundle(file: string, options: object): Promise<string> {
  return new Promise((resolve, reject) =>
    browserify(file, options).bundle((error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString("utf8"));
      }
    })
  );
}

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
    standalone: "Alfa.Pickle"
  });

  async scrape(url: string, options: ScrapeOptions = {}): Promise<Aspects> {
    const browser = await this._browser;
    const pickle = await this._pickle;

    const page = await browser.newPage();
    await page.goto(url, {
      timeout: options.timeout || 10000,
      waitUntil: options.wait || Wait.Loaded
    });

    await page.evaluate(pickle);

    const Alfa = { Pickle };

    const document = await page.evaluate(() => {
      const document = Alfa.Pickle.virtualize(window.document, {
        parents: false,
        references: true
      });

      Alfa.Pickle.layout(document);
      Alfa.Pickle.style(document);

      Alfa.Pickle.dereference(document);

      return document;
    });

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
