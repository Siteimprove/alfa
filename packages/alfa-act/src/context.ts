export const Context = {
  "@version": 1.1,

  // Namespace prefixes
  earl: {
    "@id": "http://www.w3.org/ns/earl#",
    "@prefix": true
  },
  ptr: {
    "@id": "https://www.w3.org/2009/pointers#",
    "@prefix": true
  },

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
    "@type": "earl:TestSubject"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#test
   */
  test: {
    "@id": "earl:test",
    "@type": "earl:TestCriterion"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#result
   */
  result: {
    "@id": "earl:result",
    "@type": "earl:TestResult"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#mode
   */
  mode: {
    "@id": "earl:mode",
    "@type": "earl:TestMode"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#mainAssertor
   */
  mainAssertor: {
    "@id": "earl:mainAssertor",
    "@type": "earl:Assertor"
  },

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
