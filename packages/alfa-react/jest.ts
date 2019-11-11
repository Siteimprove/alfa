import { Jest } from "@siteimprove/alfa-jest";
import { React } from "./src/react";

Jest.createPlugin(React.isType, React.asPage);
