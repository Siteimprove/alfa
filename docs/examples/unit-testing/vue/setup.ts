import { Handler } from "@siteimprove/alfa-assert";
import { Vue } from "@siteimprove/alfa-vue";
import { Page } from "@siteimprove/alfa-web";

import * as alfa from "@siteimprove/alfa-jest";
import rules from "@siteimprove/alfa-rules";
import json from "@siteimprove/alfa-formatter-json";

alfa.Jest.createPlugin<Vue.Type, Page>((value) => Vue.toPage(value), rules, [
  Handler.persist(() => "outcomes/button.spec.json", json()),
]);
