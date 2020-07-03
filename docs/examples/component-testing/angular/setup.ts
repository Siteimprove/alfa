import { Handler } from "@siteimprove/alfa-assert";
import { Angular } from "@siteimprove/alfa-angular";
import { Page } from "@siteimprove/alfa-web";

import * as alfa from "@siteimprove/alfa-jest";
import rules from "@siteimprove/alfa-rules";
import json from "@siteimprove/alfa-formatter-json";

alfa.Jest.createPlugin<Angular.Type, Page>(
  (value) => Angular.toPage(value),
  rules,
  [Handler.persist(() => "outcomes/button.spec.json", json())]
);
