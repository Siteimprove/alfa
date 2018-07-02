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

  // Classes

  /**
   * @see https://www.w3.org/TR/EARL/#Assertion
   */
  Assertion: "earl:Assertion",

  /**
   * @see https://www.w3.org/TR/EARL/#Assertor
   */
  Assertor: "earl:Assertor",

  /**
   * @see https://www.w3.org/TR/EARL/#TestSubject
   */
  TestSubject: "earl:TestSubject",

  /**
   * @see https://www.w3.org/TR/EARL/#TestCriterion
   */
  TestCriterion: "earl:TestCriterion",

  /**
   * @see https://www.w3.org/TR/EARL/#TestRequirement
   */
  TestRequirement: {
    "@id": "earl:TestRequirement",
    "@type": "TestCriterion"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#TestRequirement
   */
  TestCase: {
    "@id": "earl:TestCase",
    "@type": "TestCriterion"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#TestResult
   */
  TestResult: "earl:TestResult",

  /**
   * @see https://www.w3.org/TR/EARL/#TestMode
   */
  TestMode: "earl:TestMode",

  /**
   * @see https://www.w3.org/TR/EARL/#OutcomeValue
   */
  OutcomeValue: "earl:OutcomeValue",

  /**
   * @see https://www.w3.org/TR/EARL/#Software
   */
  Software: "earl:Software",

  // Properties

  /**
   * @see https://www.w3.org/TR/EARL/#assertedBy
   */
  assertedBy: {
    "@id": "earl:assertedBy",
    "@type": "Assertor"
  },

  /**
   * @see https://www.w3.org/TR/EARL/#subject
   */
  subject: {
    "@id": "earl:subject",
    "@type": "TestSubject"
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
    "@type": "OutcomeValue"
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
