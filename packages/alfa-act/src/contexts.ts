import { Context } from "@siteimprove/alfa-json-ld";

const Namespaces: Context = {
  /**
   * @see https://www.w3.org/TR/EARL/
   */
  earl: "http://www.w3.org/ns/earl#",

  /**
   * @see https://www.w3.org/TR/Content-in-RDF/
   */
  cnt: "http://www.w3.org/2011/content#",

  /**
   * @see https://www.w3.org/TR/HTTP-in-RDF/
   */
  http: "http://www.w3.org/2011/http#",

  /**
   * @see https://www.w3.org/TR/Pointers-in-RDF/
   */
  ptr: "https://www.w3.org/2009/pointers#",

  /**
   * @see https://www.w3.org/TR/WCAG/
   */
  wcag: "https://www.w3.org/TR/WCAG/#",

  /**
   * @see https://siteimprove.github.io/sanshikan/
   */
  sanshikan: "https://siteimprove.github.io/sanshikan/"
};

export namespace Contexts {
  /**
   * @see https://www.w3.org/TR/EARL/#Assertion
   */
  export const Assertion: Context = {
    ...Namespaces,

    // Properties

    /**
     * @see https://www.w3.org/TR/EARL/#assertedBy
     */
    assertedBy: {
      "@id": "earl:assertedBy",
      "@type": "earl:Assertor"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#subject
     */
    subject: {
      "@id": "earl:subject",
      "@type": "earl:TestSubject",
      "@container": "@set"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#test
     */
    test: {
      "@id": "earl:test",
      "@type": "earl:TestCriterion",
      "@container": "@set"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#mode
     */
    mode: {
      "@id": "earl:mode",
      "@type": "earl:TestMode"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#result
     */
    result: {
      "@id": "earl:result",
      "@type": "earl:TestResult",
      "@container": "@set"
    }
  };

  /**
   * @see https://www.w3.org/TR/EARL/#TestResult
   */
  export const Result: Context = {
    /**
     * @see https://www.w3.org/TR/EARL/#outcome
     */
    outcome: {
      "@id": "earl:outcome",
      "@type": "earl:OutcomeValue"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#pointer
     */
    pointer: {
      "@id": "earl:pointer",
      "@type": "ptr:Pointer"
    },

    /**
     * @see https://www.w3.org/TR/EARL/#info
     */
    info: "earl:info"
  };

  /**
   * @see https://www.w3.org/TR/HTTP-in-RDF/#MessageClass
   */
  export const Message: Context = {
    ...Namespaces,

    // Properties

    /**
     * @see https://www.w3.org/TR/HTTP-in-RDF/#headersProperty
     */
    headers: {
      "@id": "http:headers",
      "@type": "http:MessageHeader",
      "@container": "@set"
    },

    /**
     * @see https://www.w3.org/TR/HTTP-in-RDF/#bodyProperty
     */
    body: {
      "@id": "http:body",
      "@type": "cnt:ContentAsText"
    }
  };

  /**
   * @see https://www.w3.org/TR/HTTP-in-RDF/#RequestClass
   */
  export const Request: Context = {
    ...Namespaces,
    ...Message,

    // Properties

    /**
     * @see https://www.w3.org/TR/HTTP-in-RDF/#methodNameProperty
     */
    methodName: "http:methodName",

    /**
     * @see https://www.w3.org/TR/HTTP-in-RDF/#requestURIProperty
     */
    requestURI: "http:requestURI"
  };

  /**
   * @see https://www.w3.org/TR/HTTP-in-RDF/#ResponseClass
   */
  export const Response: Context = {
    ...Namespaces,
    ...Message,

    // Properties

    /**
     * @see https://www.w3.org/TR/HTTP-in-RDF/#statusCodeValueProperty
     */
    statusCodeValue: "http:statusCodeValue"
  };

  /**
   * @see https://www.w3.org/TR/Content-in-RDF/#ContentClass
   */
  export const Content: Context = {
    ...Namespaces,

    // Properties

    /**
     * @see https://www.w3.org/TR/Content-in-RDF/#characterEncodingProperty
     */
    characterEncoding: "cnt:characterEncoding",

    /**
     * @see https://www.w3.org/TR/Content-in-RDF/#charsProperty
     */
    chars: "cnt:chars"
  };

  /**
   * @see https://www.w3.org/TR/Pointers-in-RDF/#offsetPointerClass
   */
  export const OffsetPointer: Context = {
    ...Namespaces,

    // Properties

    /**
     * @see https://www.w3.org/TR/Pointers-in-RDF/#referenceProperty
     */
    reference: {
      "@id": "ptr:reference",
      "@type": "earl:TestSubject"
    },

    /**
     * @see https://www.w3.org/TR/Pointers-in-RDF/#offsetProperty
     */
    offset: "ptr:offset"
  };

  /**
   * @see https://www.w3.org/TR/Pointers-in-RDF/#xPathPointerClass
   */
  export const XPathPointer: Context = {
    ...Namespaces,

    // Properties

    /**
     * @see https://www.w3.org/TR/Pointers-in-RDF/#referenceProperty
     */
    reference: {
      "@id": "ptr:reference",
      "@type": "earl:TestSubject"
    },

    /**
     * @see https://www.w3.org/TR/Pointers-in-RDF/#expressionProperty
     */
    expression: "ptr:expression"
  };
}
