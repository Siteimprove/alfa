import { createJestPlugin } from "@siteimprove/alfa-jest";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

createJestPlugin(isEnzymeWrapper, fromEnzymeWrapper);
