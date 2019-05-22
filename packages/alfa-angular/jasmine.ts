import { createJasminePlugin } from "@siteimprove/alfa-jasmine";
import { fromAngularElement } from "./src/from-angular-element";
import { isAngularElement } from "./src/is-angular-element";

createJasminePlugin(isAngularElement, fromAngularElement);
