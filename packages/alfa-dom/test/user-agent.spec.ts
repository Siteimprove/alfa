import { test } from "@siteimprove/alfa-test";
import { Rule, RuleType } from "../src/types";
import { isUserAgentRule, UserAgent } from "../src/user-agent";

test("Parses UA style sheet without blowing up", t => {
  t(UserAgent.cssRules.length > 0);
});

test("An User-Agent CSS rule is being parsed as being an UA rule", t => {
  t(isUserAgentRule(UserAgent.cssRules[0]));
});

test("A non User-Agent CSS rule is not being parsed as being an UA rule", t => {
  const rule: Rule = {
    type: RuleType.Style // something
  };
  t(!isUserAgentRule(rule));
});
