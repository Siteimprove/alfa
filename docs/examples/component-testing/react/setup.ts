import { Handler } from "@siteimprove/alfa-assert";
import { Enzyme } from "@siteimprove/alfa-enzyme";
import { Page } from "@siteimprove/alfa-web";

import * as alfa from "@siteimprove/alfa-jest";
import rules from "@siteimprove/alfa-rules";
import json from "@siteimprove/alfa-formatter-json";

import * as enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

enzyme.configure({ adapter: new Adapter() });

alfa.Jest.createPlugin<Enzyme.Type, Page>(
  (value) => Enzyme.toPage(value),
  rules,
  [Handler.persist(() => "outcomes/button.spec.json", json())]
);
