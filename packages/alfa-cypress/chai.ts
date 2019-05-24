import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromCypressElement } from "./src/from-cypress-element";
import { isCypressElement } from "./src/is-cypress-element";

// tslint:disable:no-default-export

export default createChaiPlugin(isCypressElement, fromCypressElement);
