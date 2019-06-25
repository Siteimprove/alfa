import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

// tslint:disable:no-default-export

export default createUnexpectedPlugin(isEnzymeWrapper, fromEnzymeWrapper);
