import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";
import { Angular } from "./src/angular";

export default Chai.createPlugin(Angular.isType, value =>
  Future.settle(Angular.asPage(value))
);
