import { createJestPlugin } from "@siteimprove/alfa-jest";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

createJestPlugin(isReactElement, fromReactElement);

