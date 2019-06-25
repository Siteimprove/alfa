import { isAssertable } from "@siteimprove/alfa-assert";
import { createJasminePlugin } from "./src/create-jasmine-plugin";

createJasminePlugin(isAssertable, node => node);
