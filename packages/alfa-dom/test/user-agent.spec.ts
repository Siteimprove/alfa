import { test } from "@siteimprove/alfa-test";
import { UserAgent } from "../src/user-agent";

test("Parses UA style sheet without blowing up", t => {
  t(UserAgent.cssRules.length > 0);
});
