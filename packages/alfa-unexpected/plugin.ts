import { isAssertable } from "@siteimprove/alfa-assert";
import { createUnexpectedPlugin } from "./src/create-unexpected-plugin";

// tslint:disable:no-default-export

export default createUnexpectedPlugin(isAssertable, node => node);
