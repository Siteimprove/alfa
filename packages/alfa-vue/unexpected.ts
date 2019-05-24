import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromVueWrapper } from "./src/from-vue-wrapper";
import { isVueWrapper } from "./src/is-vue-wrapper";

// tslint:disable:no-default-export

export default createUnexpectedPlugin(isVueWrapper, fromVueWrapper);
