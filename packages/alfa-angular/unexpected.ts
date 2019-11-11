import { Unexpected } from "@siteimprove/alfa-unexpected";
import { Angular } from "./src/angular";

export default Unexpected.createPlugin(Angular.isType, Angular.asPage);
