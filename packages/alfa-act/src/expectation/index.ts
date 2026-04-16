/*
 * Functionalities for handling expectations.
 *
 * Expectations returned by rules are interviews: either a result or a question.
 * Interviews can be conducted with the help of an oracle. If the oracle can
 * answer all questions, we get a conclusive finding; otherwise, we get an
 * inconclusive one.
 * Conclusive findings are Results, with Ok meaning a Passed expectation, and
 * Error meaning a Failed one. Both cases contain a Diagnostic.
 */

export * from "./diagnostic.ts";
export * from "./finding.ts";
export * from "./interview.ts";
export * from "./oracle.ts";
export * from "./question.ts";
