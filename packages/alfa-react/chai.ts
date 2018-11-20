import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

export const Plugin = createChaiPlugin(isReactElement, fromReactElement);
