import { createChaiPlugin } from "@siteimprove/alfa-chai";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

// tslint:disable:no-default-export

export default createChaiPlugin(isReactElement, fromReactElement);
