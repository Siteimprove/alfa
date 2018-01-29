import { launch } from "puppeteer";
import browserify from "browserify";
import { Node } from "@alfa/dom";
import { Aspects } from "@alfa/rule";
import * as Pickle from "@alfa/pickle";

const PICKLE = require.resolve("@alfa/pickle");

const { parentize } = Pickle;

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

    const virtual = await page.evaluate(() => {
      const dom = Alfa.Pickle.virtualize(document, { parents: false });
      const layout = Alfa.Pickle.layout(dom).values();
      const style = Alfa.Pickle.style(dom).values();

      Alfa.Pickle.dereference(dom);

      return { dom, style: [...style], layout: [...layout] };
    });

    await page.close();

    return {
      document: virtual.dom,
      style: virtual.style,
      layout: virtual.layout
    };
  }

  async close(): Promise<void> {
    const browser = await this._browser;
    await browser.close();
  }
}
