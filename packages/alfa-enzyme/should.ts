import { createShouldPlugin } from "@siteimprove/alfa-should";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

export const Plugin = createShouldPlugin(isEnzymeWrapper, fromEnzymeWrapper);
