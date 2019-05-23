import { createJestPlugin } from "@siteimprove/alfa-jest";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

createJestPlugin(isVueWrapper, fromVueWrapper);
