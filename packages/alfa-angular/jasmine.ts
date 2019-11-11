import { Jasmine } from "@siteimprove/alfa-jasmine";
import { Angular } from "./src/angular";

Jasmine.createPlugin(Angular.isType, Angular.asPage);
