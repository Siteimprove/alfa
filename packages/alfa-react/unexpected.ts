import { createUnexpectedPlugin } from "@siteimprove/alfa-unexpected";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

export const Plugin = createUnexpectedPlugin(isReactElement, fromReactElement);
