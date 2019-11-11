import { Jest } from "@siteimprove/alfa-jest";
import { Vue } from "./src/vue";

Jest.createPlugin(Vue.isType, Vue.asPage);
