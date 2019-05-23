import { createShouldPlugin } from "@siteimprove/alfa-should";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

export const Plugin = createShouldPlugin(isVueWrapper, fromVueWrapper);
