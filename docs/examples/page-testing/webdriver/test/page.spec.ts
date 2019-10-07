/// <reference types="@siteimprove/alfa-chai" />

import alfa from "@siteimprove/alfa-webdriver/chai";
import chai from "chai";

chai.use(alfa);

const { expect } = chai;

describe("page.html", () => {
  before(async () => {
    await browser.url(`file://${require.resolve("./fixtures/page.html")}`);
  });

  it("should be accessible", async () => {
    await expect(await browser.$("html")).to.be.accessible;
  });
});
