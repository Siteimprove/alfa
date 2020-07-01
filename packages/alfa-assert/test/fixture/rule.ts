import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Result, Err } from "@siteimprove/alfa-result";

export const Pass = Rule.Atomic.of<string, string>({
  uri: "pass",

  evaluate(input) {
    return {
      applicability() {
        return [input];
      },

      expectations() {
        return {
          1: Result.of(Diagnostic.of("Success!")),
        };
      },
    };
  },
});

export const Fail = Rule.Atomic.of<string, string>({
  uri: "fail",

  evaluate(input) {
    return {
      applicability() {
        return [input];
      },

      expectations() {
        return {
          1: Err.of(Diagnostic.of("Failure!")),
        };
      },
    };
  },
});
