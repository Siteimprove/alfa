import { createJestPlugin } from "@siteimprove/alfa-jest";
import { fromAngularElement } from "./src/from-angular-element";
import { isAngularElement } from "./src/is-angular-element";

createJestPlugin(isAngularElement, fromAngularElement);
