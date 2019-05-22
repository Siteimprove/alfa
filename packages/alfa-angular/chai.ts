import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromAngularElement } from "./src/from-angular-element";
import { isAngularElement } from "./src/is-angular-element";

export const Plugin = createChaiPlugin(isAngularElement, fromAngularElement);
