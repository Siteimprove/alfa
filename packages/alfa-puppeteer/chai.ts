import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";
import { Puppeteer } from "./src/puppeteer";

export default Chai.createPlugin(Puppeteer.isType, value =>
  Future.from(Puppeteer.asPage(value))
);
