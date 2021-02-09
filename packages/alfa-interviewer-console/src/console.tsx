import { Future } from "@siteimprove/alfa-future";
import { Interviewer } from "@siteimprove/alfa-interviewer";
import { None } from "@siteimprove/alfa-option";

export default function <I, T, Q>(): Interviewer<I, T, Q> {
  return function Console(input, rules) {
    return (rule, question) => {
      return Future.now(None);
    };
  };
}
