import { isAssertable } from "@siteimprove/alfa-assert";
import { createChaiPlugin } from "./src/create-chai-plugin";

// tslint:disable:no-default-export

export default createChaiPlugin(isAssertable, node => node);
