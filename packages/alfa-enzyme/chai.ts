import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

export const Plugin = createChaiPlugin(isEnzymeWrapper, fromEnzymeWrapper);
