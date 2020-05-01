import { Page } from "@siteimprove/alfa-web";
import { Unexpected } from "./src/unexpected";

export default Unexpected.createPlugin(Page.isPage, (page) => page);
