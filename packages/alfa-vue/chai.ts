import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

export const Plugin = createChaiPlugin(isVueWrapper, fromVueWrapper);
