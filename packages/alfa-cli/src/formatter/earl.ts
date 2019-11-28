import { expand } from "@siteimprove/alfa-json-ld";

import { Formatter } from "../formatter";

const { stringify } = JSON;

export default function<I, T, Q>(): Formatter<I, T, Q> {
  return function EARL(outcomes) {
    return stringify(
      expand([...outcomes].map(outcome => outcome.toEARL())),
      null,
      2
    );
  };
}
