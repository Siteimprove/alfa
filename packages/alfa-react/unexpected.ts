import { Unexpected } from "@siteimprove/alfa-unexpected";

import { React } from "./src/react";

export default Unexpected.createPlugin(React.isType, React.asPage);
