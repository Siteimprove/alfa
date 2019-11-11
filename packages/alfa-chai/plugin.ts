import { Future } from "@siteimprove/alfa-future";
import { Page } from "@siteimprove/alfa-web";
import { Chai } from "./src/chai";

export default Chai.createPlugin(Page.isPage, Future.settle);
