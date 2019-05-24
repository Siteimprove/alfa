import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

// tslint:disable:no-default-export

export default createChaiPlugin(isVueWrapper, fromVueWrapper);
