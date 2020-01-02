import { Jasmine } from "@siteimprove/alfa-jasmine";

import { React } from "./src/react";

Jasmine.createPlugin(React.isType, React.asPage);
