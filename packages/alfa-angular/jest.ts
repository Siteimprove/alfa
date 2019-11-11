import { Jest } from "@siteimprove/alfa-jest";
import { Angular } from "./src/angular";

Jest.createPlugin(Angular.isType, Angular.asPage);
