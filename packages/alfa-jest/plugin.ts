import { isAssertable } from "@siteimprove/alfa-assert";
import { createJestPlugin } from "./src/create-jest-plugin";

createJestPlugin(isAssertable, node => node);
