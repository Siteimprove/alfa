import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromEnzymeWrapper } from "./src/from-enzyme-wrapper";
import { isEnzymeWrapper } from "./src/is-enzyme-wrapper";

export const Plugin = createUnexpectedPlugin(
  isEnzymeWrapper,
  fromEnzymeWrapper
);
