import { Page } from "@siteimprove/alfa-web";
import { Jasmine } from "./src/jasmine";

Jasmine.createPlugin(Page.isPage, page => page);
