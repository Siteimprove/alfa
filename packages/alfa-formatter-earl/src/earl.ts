import { Serializable, EARL } from "@siteimprove/alfa-earl";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";

import * as jsonld from "jsonld";

import { version } from "../package.json";

const { stringify } = JSON;

/**
 * @public
 */
export default function <I, T extends Hashable, Q, S>(): Formatter<I, T, Q, S> {
  return function EARL(input, rules, outcomes) {
    const subject = Serializable.toEARL(input);

    let earl = {
      "@context": ACTContext,
      "@graph": [
        assertor,
        ...subject,
        ...[...rules].map((rule) => rule.toEARL()),
        ...[...outcomes].map((outcome) => {
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
    } as jsonld.JsonLdDocument;

    return Future.from(jsonld.compact(earl, ACTContext)).map((compact) =>
      stringify(compact, null, 2)
    );
  };
}

const assertor: EARL = {
  "@context": {
    earl: "http://www.w3.org/ns/earl#",
    doap: "http://usefulinc.com/ns/doap#",
    foaf: "http://xmlns.com/foaf/0.1/",
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

/**
 * The JSON-LD context used by ACT rules CG
 * {@link https://act-rules.github.io/earl-context.json}
 */
// We want a local copy of the context to avoid network connexion when
// compacting JSON-LD documents.
const ACTContext = {
  "@vocab": "http://www.w3.org/ns/earl#",
  earl: "http://www.w3.org/ns/earl#",
  WCAG: "https://www.w3.org/TR/WCAG/#",
  WCAG10: "https://www.w3.org/TR/WCAG10/#",
  WCAG2: "https://www.w3.org/TR/WCAG2/#",
  WCAG20: "https://www.w3.org/TR/WCAG20/#",
  WCAG21: "https://www.w3.org/TR/WCAG21/#",
  WCAG22: "https://www.w3.org/TR/WCAG22/#",
  WCAG30: "https://www.w3.org/TR/wcag-3.0/#",
  dct: "http://purl.org/dc/terms/",
  sch: "https://schema.org/",
  doap: "http://usefulinc.com/ns/doap#",
  foaf: "http://xmlns.com/foaf/0.1/",
  ptr: "http://www.w3.org/2009/pointers#",
  cnt: "http://www.w3.org/2011/content#",
  "http-vocab": "http://www.w3.org/2011/http#",
  WebPage: "sch:WebPage",
  url: "dct:source",
  source: "dct:source",
  redirectedTo: "dct:source",
  title: "dct:title",
  Project: "doap:Project",
  Version: "doap:Version",
  name: "doap:name",
  description: "doap:description",
  shortdesc: "doap:shortdesc",
  created: "doap:created",
  release: "doap:release",
  revision: "doap:revision",
  homepage: {
    "@id": "doap:homepage",
    "@type": "@id",
  },
  license: {
    "@id": "doap:license",
    "@type": "@id",
  },
  assertedThat: {
    "@reverse": "assertedBy",
  },
  assertions: {
    "@reverse": "subject",
  },
  assertedBy: {
    "@type": "@id",
  },
  outcome: {
    "@type": "@id",
  },
  mode: {
    "@type": "@id",
  },
  pointer: {
    "@type": "ptr:CSSSelectorPointer",
  },
  isPartOf: {
    "@id": "dct:isPartOf",
    "@type": "@id",
  },
};
