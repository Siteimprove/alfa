import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

export const Plugin = createUnexpectedPlugin(isVueWrapper, fromVueWrapper);
