import { createJasminePlugin } from "@siteimprove/alfa-jasmine";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

createJasminePlugin(isEnzymeWrapper, fromEnzymeWrapper);
