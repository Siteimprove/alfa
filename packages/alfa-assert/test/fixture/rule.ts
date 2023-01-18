import { Diagnostic, Question, Rule } from "@siteimprove/alfa-act";
import { Hashable } from "@siteimprove/alfa-hash";
import { Result, Err } from "@siteimprove/alfa-result";

export const Pass = <T extends Hashable, Q = never>(uri: string) =>
  Rule.Atomic.of<T, T, Q>({
    uri,

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

export const Fail = <T extends Hashable, Q = never>(uri: string) =>
  Rule.Atomic.of<T, T, Q>({
    uri,

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

export const CantTell = <T extends Hashable>(uri: string) =>
  Rule.Atomic.of<T, T, { "is-passed": ["boolean", boolean] }>({
    uri,

    evaluate(input) {
      return {
        applicability() {
          return [input];
        },

        expectations(target) {
          const isPassed = Question.of<"boolean", T, T, boolean, "is-passed">(
            "boolean",
            "is-passed",
            "Does the rule pass?",
            target,
            target
          );
          return {
            1: isPassed.map((passed) =>
              passed
                ? Result.of(Diagnostic.of("Success!"))
                : Err.of(Diagnostic.of("Failure!"))
            ),
          };
        },
      };
    },
  });
