import { Jasmine } from "@siteimprove/alfa-jasmine";

import { Enzyme } from "./src/enzyme";

Jasmine.createPlugin(Enzyme.isType, Enzyme.asPage);
