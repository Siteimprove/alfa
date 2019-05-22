import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromAngularElement } from "./src/from-angular-element";
import { isAngularElement } from "./src/is-angular-element";

export const Plugin = createUnexpectedPlugin(
  isAngularElement,
  fromAngularElement
);
