import { createJasminePlugin } from "@siteimprove/alfa-jasmine";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

createJasminePlugin(isVueWrapper, fromVueWrapper);
