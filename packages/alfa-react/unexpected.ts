import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

// tslint:disable:no-default-export

export default createUnexpectedPlugin(isReactElement, fromReactElement);
