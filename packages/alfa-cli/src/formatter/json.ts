import { Serializable } from "@siteimprove/alfa-json";

import { Formatter } from "../formatter";

const { stringify } = JSON;

export default function <I, T, Q>(): Formatter<I, T, Q> {
  return function JSON(input, outcomes) {
    return stringify(
      {
        input: Serializable.toJSON(input),
        outcomes: [...outcomes].map((outcome) => outcome.toJSON()),
      },
      null,
      2
    );
  };
}
