/// <reference types="@siteimprove/alfa-chai" />

import alfa from "@siteimprove/alfa-puppeteer/chai";
import chai from "chai";
import puppeteer from "puppeteer";

chai.use(alfa);

const { expect } = chai;

describe("page.html", () => {
  let browser: puppeteer.Browser;

  before(async () => {
    browser = await puppeteer.launch();
  });

  after(async () => {
    await browser.close();
  });

  it("should be accessible", async () => {
    const [page] = await browser.pages();

    await page.goto(`file://${require.resolve("./fixtures/page.html")}`);

    await expect(await page.$("html")).to.be.accessible;
  });
});
