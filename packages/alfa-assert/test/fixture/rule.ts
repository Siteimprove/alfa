import { Diagnostic, Question, Rule } from "@siteimprove/alfa-act";
import { Result, Err } from "@siteimprove/alfa-result";

export const Pass = (uri: string) =>
  Rule.Atomic.of<string, string>({
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

export const Fail = (uri: string) =>
  Rule.Atomic.of<string, string>({
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

export const CantTell = (uri: string) =>
  Rule.Atomic.of<string, string, { boolean: boolean }>({
    uri,

    evaluate(input) {
      return {
        applicability() {
          return [input];
        },

        expectations(target) {
          const isPassed = Question.of<"boolean", string, string, boolean>(
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
