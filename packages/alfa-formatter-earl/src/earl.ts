import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Serializable, EARL } from "@siteimprove/alfa-earl";
import { Formatter } from "@siteimprove/alfa-formatter";

import { version } from "../package.json";

const { stringify } = JSON;

/**
 * @public
 */
export default function <I, T, Q, S>(): Formatter<I, T, Q, S> {
  return function EARL(input, rules, outcomes) {
    const subject = Serializable.toEARL(input);

    const assertor: EARL = {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        doap: "http://usefulinc.com/ns/doap#",
        foaf: "http://xmlns.com/foaf/spec/#",
      },
      "@id": "https://alfa.siteimprove.com/",
      "@type": ["earl:Assertor", "earl:Software", "doap:Project"],
      "doap:name": "Alfa",
      "doap:homepage": "https://alfa.siteimprove.com/",
      "doap:release": {
        "@type": "doap:Version",
        "doap:revision": version,
      },
      "doap:license": "https://spdx.org/licenses/MIT",
      "doap:description":
        "Suite of open and standards-based tools for performing reliable accessibility conformance testing at scale",
      "doap:repository": {
        "@type": "doap:GitRepository",
        "doap:browse": "https://github.com/siteimprove/alfa",
        "doap:location": "https://github.com/siteimprove/alfa.git",
      },
      "doap:vendor": {
        "@id": "https://siteimprove.com/",
        "@type": "foaf:Organization",
        "foaf:name": "Siteimprove A/S",
      },
    };

    return stringify(
      [
        assertor,
        ...subject,
        ...[...rules]
          .filter<Rule<I, T, Q, S>>(Rule.isRule)
          .map((rule) => rule.toEARL()),
        ...[...outcomes]
          .filter<Outcome<I, T, Q, S>>(Outcome.isOutcome)
          .map((outcome) => {
            const earl = outcome.toEARL();

            for (const _ of subject) {
              earl["earl:assertedBy"] = {
                "@id": assertor["@id"],
              };

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
