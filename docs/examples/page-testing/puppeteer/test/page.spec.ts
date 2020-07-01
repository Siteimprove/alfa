/// <reference types="mocha" />

import * as chai from "chai";
import * as puppeteer from "puppeteer";

import { Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Puppeteer } from "@siteimprove/alfa-puppeteer";
import { Page } from "@siteimprove/alfa-web";

import * as alfa from "@siteimprove/alfa-chai";
import rules from "@siteimprove/alfa-rules";

chai.use(
  alfa.Chai.createPlugin<Puppeteer.Type, Page>(
    (value) => Future.from(Puppeteer.toPage(value)),
    rules,
    [Handler.persist(() => "test/outcomes/page.spec.json")]
  )
);

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
    await expect(await page.$("html")).to.be.accessible();
  });
});
