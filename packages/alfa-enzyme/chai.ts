import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";
import { Enzyme } from "./src/enzyme";

export default Chai.createPlugin(Enzyme.isType, value =>
  Future.settle(Enzyme.asPage(value))
);
