/// <reference types="@siteimprove/alfa-chai" />

import alfa from "@siteimprove/alfa-puppeteer/chai";
import chai from "chai";
import puppeteer from "puppeteer";

chai.use(alfa);

const { expect } = chai;

describe("page.html", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;

  before(async () => {
    browser = await puppeteer.launch();
    [page] = await browser.pages();

    await page.goto(`file://${require.resolve("./fixtures/page.html")}`);
  });

  after(async () => {
    await browser.close();
  });

  it("should be accessible", async () => {
    await expect(await page.$("html")).to.be.accessible;
  });
});
