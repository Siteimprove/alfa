import { Chai } from "@siteimprove/alfa-chai";
import { Future } from "@siteimprove/alfa-future";

import { Vue } from "./src/vue";

export default Chai.createPlugin(Vue.isType, (value) =>
  Future.now(Vue.asPage(value))
);
