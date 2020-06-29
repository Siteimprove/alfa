import { Serializable } from "@siteimprove/alfa-earl";
import { Formatter } from "@siteimprove/alfa-formatter";

const { stringify } = JSON;

export default function <I, T, Q>(): Formatter<I, T, Q> {
  return function EARL(input, outcomes) {
    const subject = Serializable.toEARL(input);

    return stringify(
      [
        ...subject,
        ...[...outcomes].map((outcome) => {
          const earl = outcome.toEARL();

          for (const _ of subject) {
            earl["earl:subject"] = {
              "@id": _["@id"],
            };
          }

          return earl;
        }),
      ],
      null,
      2
    );
  };
}
