import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";

import { React } from "./src/react";

export default Chai.createPlugin(React.isType, (value) =>
  Future.now(React.asPage(value))
);
