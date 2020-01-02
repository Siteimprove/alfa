import { Unexpected } from "@siteimprove/alfa-unexpected";

import { Enzyme } from "./src/enzyme";

export default Unexpected.createPlugin(Enzyme.isType, Enzyme.asPage);
