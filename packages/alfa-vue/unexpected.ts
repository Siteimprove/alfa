import { Unexpected } from "@siteimprove/alfa-unexpected";
import { Vue } from "./src/vue";

export default Unexpected.createPlugin(Vue.isType, Vue.asPage);
