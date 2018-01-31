import { launch, Browser, Page } from "puppeteer";
import { rollup } from "rollup";

const isBuiltin = require("is-builtin-module");
const node = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

async function bundle(name: string, file: string): Promise<string> {
  const bundle = await rollup({
    input: file,
    plugins: [node(), commonjs({ ignore: isBuiltin })]
  });

  let { code, map } = await bundle.generate({
    name,
    format: "iife",
    exports: "named",
    sourcemap: true
  });

  code += `\n//# sourceMappingURL=${map.toUrl()}\n`;

  return code;
}

export class BrowsingContext<T> {
  private readonly id: string = "_" +
    Math.random()
      .toString(36)
      .substr(2, 10);

  private readonly browser: Promise<Browser>;
  private readonly page: Promise<Page>;

  constructor(entry: string) {
    this.browser = launch({ headless: false });

    this.page = this.browser.then(async browser => {
      const page = await browser.newPage();
      const script = await bundle(this.id, entry);

      await page.evaluate(script);

      return page;
    });
  }

  public async evaluate<R>(
    callback: (environment: T, ...args: Array<any>) => R,
    ...args: Array<any>
  ): Promise<R> {
    const page = await this.page;
    const handle = await page.evaluateHandle(this.id);
    return await page.evaluate(callback, handle, ...args);
  }

  public async close(): Promise<void> {
    const browser = await this.browser;
    await browser.close();
  }
}
