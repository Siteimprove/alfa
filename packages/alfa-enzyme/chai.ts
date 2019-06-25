import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

// tslint:disable:no-default-export

export default createChaiPlugin(isEnzymeWrapper, fromEnzymeWrapper);
