/// <reference types="webdriverio" />

import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";

import { WebElement } from "./src/web-element";

export default Chai.createPlugin(WebElement.isType, webElement =>
  Future.from(WebElement.asPage(webElement, browser))
);
