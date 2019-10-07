/// <reference types="webdriverio" />

import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromWebElement } from "./src/from-web-element";
import { isWebElement } from "./src/is-web-element";

// tslint:disable:no-default-export

export default createChaiPlugin(isWebElement, webElement =>
  fromWebElement(webElement, browser)
);
