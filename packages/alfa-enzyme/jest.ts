import { Jest } from "@siteimprove/alfa-jest";
import { Enzyme } from "./src/enzyme";

Jest.createPlugin(Enzyme.isType, Enzyme.asPage);
