import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromPuppeteerHandle } from "./src/from-puppeteer-handle";
import { isPuppeteerHandle } from "./src/is-puppeteer-handle";

// tslint:disable:no-default-export

export default createChaiPlugin(isPuppeteerHandle, fromPuppeteerHandle);
