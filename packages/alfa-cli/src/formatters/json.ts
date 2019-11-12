import { Formatter } from "../types";

const { stringify } = JSON;

export default function<I, T, Q>(): Formatter<I, T, Q> {
  return function JSON(outcomes) {
    return stringify([...outcomes].map(outcome => outcome.toJSON()), null, 2);
  };
}
