import { createShouldPlugin } from "@siteimprove/alfa-should";
import { fromAngularElement } from "./src/from-angular-element";
import { isAngularElement } from "./src/is-angular-element";

export const Plugin = createShouldPlugin(isAngularElement, fromAngularElement);
