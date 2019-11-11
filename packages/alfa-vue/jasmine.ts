import { Jasmine } from "@siteimprove/alfa-jasmine";
import { Vue } from "./src/vue";

Jasmine.createPlugin(Vue.isType, Vue.asPage);
