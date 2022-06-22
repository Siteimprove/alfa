import { Document } from "@siteimprove/alfa-json-ld";

/**
 * @public
 */
export interface EARL extends Document {
  "@context"?: {
    earl?: "http://www.w3.org/ns/earl#";
    cnt?: "http://www.w3.org/2011/content#";
    dct?: "http://purl.org/dc/terms/";
    doap?: "http://usefulinc.com/ns/doap#";
    // https://github.com/w3c/json-ld-syntax/issues/399#issuecomment-1161749807
    foaf?: "http://xmlns.com/foaf/0.1/";
    http?: "http://www.w3.org/2011/http#";
    ptr?: "http://www.w3.org/2009/pointers#";
  };
}

/**
 * @public
 */
export namespace EARL {
  /**
   * The JSON-LD context used by ACT rules CG
   * {@link https://act-rules.github.io/earl-context.json}
   */
  // We want a local copy of the context to avoid network connexion when
  // compacting JSON-LD documents.
  const ACTContext = {
    "@vocab": "http://www.w3.org/ns/earl#",
    earl: "http://www.w3.org/ns/earl#",
    WCAG: "http://www.w3.org/TR/WCAG/#",
    WCAG10: "http://www.w3.org/TR/WCAG10/#",
    WCAG2: "http://www.w3.org/TR/WCAG2/#",
    WCAG20: "http://www.w3.org/TR/WCAG20/#",
    WCAG21: "http://www.w3.org/TR/WCAG21/#",
    WCAG22: "http://www.w3.org/TR/WCAG22/#",
    WCAG30: "http://www.w3.org/TR/wcag-3.0/#",
    dct: "http://purl.org/dc/terms/",
    sch: "https://schema.org/",
    doap: "http://usefulinc.com/ns/doap#",
    foaf: "http://xmlns.com/foaf/0.1/",
    ptr: "http://www.w3.org/2009/pointers#",
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
}
