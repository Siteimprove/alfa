import { createJasminePlugin } from "@siteimprove/alfa-jasmine";
import { fromReactElement } from "./src/from-react-element";
import { isReactElement } from "./src/is-react-element";

createJasminePlugin(isReactElement, fromReactElement);
