/// <reference types="mocha" />

import * as chai from "chai";

import { Handler } from "@siteimprove/alfa-assert";
import { Future } from "@siteimprove/alfa-future";
import { Page } from "@siteimprove/alfa-web";
import { WebElement } from "@siteimprove/alfa-webdriver";

import * as alfa from "@siteimprove/alfa-chai";
import rules from "@siteimprove/alfa-rules";

chai.use(
  alfa.Chai.createPlugin<WebElement, Page>(
    (value) => Future.from(WebElement.toPage(value, browser)),
    rules,
    [Handler.persist(() => "test/outcomes/page.spec.json")]
  )
);

const { expect } = chai;

describe("page.html", () => {
  before(async () => {
    await browser.url(`file://${require.resolve("./fixtures/page.html")}`);
  });

  it("should be accessible", async () => {
    await expect(await browser.$("html")).to.be.accessible();
  });
});
