import { Formatter } from "@siteimprove/alfa-formatter";
import { Serializable } from "@siteimprove/alfa-json";

const { stringify } = JSON;

export default function <I, T, Q>(): Formatter<I, T, Q> {
  return function JSON(input, rules, outcomes) {
    return stringify(
      {
        input: Serializable.toJSON(input),
        rules: [...rules].map((rule) => rule.toJSON()),
        outcomes: [...outcomes].map((outcome) => outcome.toJSON()),
      },
      null,
      2
    );
  };
}
