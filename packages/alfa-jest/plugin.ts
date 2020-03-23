import { Page } from "@siteimprove/alfa-web";
import { Jest } from "./src/jest";

Jest.createPlugin(Page.isPage, (page) => page);
