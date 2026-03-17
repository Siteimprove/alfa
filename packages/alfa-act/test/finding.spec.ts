import { test } from "@siteimprove/alfa-test";

import { Diagnostic } from "../dist/diagnostic.js";
import { Finding } from "../dist/finding/index.js";

const diagnostic = Diagnostic.of("placeholder message");

test(".conclusive() creates a Conclusive finding with the given answer", (t) => {
  const finding = Finding.conclusive(42);

  t(Finding.isConclusive(finding));
  t.equal(finding.answer, 42);
  t.equal(finding.oracleUsed, false);
});

test(".conclusive() creates a Conclusive finding with oracle used", (t) => {
  const finding = Finding.conclusive(42, true);

  t(Finding.isConclusive(finding));
  t.equal(finding.answer, 42);
  t.equal(finding.oracleUsed, true);
});

test(".inconclusive() creates an Inconclusive finding with the given diagnostic", (t) => {
  const finding = Finding.inconclusive(diagnostic);

  t(Finding.isInconclusive(finding));
  t.equal(finding.diagnostic, diagnostic);
  t.equal(finding.oracleUsed, false);
});

test(".inconclusive() creates an Inconclusive finding with oracle used", (t) => {
  const finding = Finding.inconclusive(diagnostic, true);

  t(Finding.isInconclusive(finding));
  t.equal(finding.diagnostic, diagnostic);
  t.equal(finding.oracleUsed, true);
});

test("type guards work for a Conclusive finding", (t) => {
  const conclusive = Finding.conclusive(1);

  t(Finding.isFinding(conclusive));
  t(Finding.isConclusive(conclusive));
  t(!Finding.isInconclusive(conclusive));
});

test("type guards work for an Inconclusive finding", (t) => {
  const inconclusive = Finding.inconclusive(diagnostic);

  t(Finding.isFinding(inconclusive));
  t(!Finding.isConclusive(inconclusive));
  t(Finding.isInconclusive(inconclusive));
});

test("type guards work for a non-Finding value", (t) => {
  t(!Finding.isFinding("not a finding"));
  t(!Finding.isConclusive("not a finding"));
  t(!Finding.isInconclusive("not a finding"));
});

test("#withOracle() on a finding returns a new finding with oracleUsed set to true", (t) => {
  const finding = Finding.conclusive(42);
  const withOracle = finding.withOracle();

  t.equal(withOracle.oracleUsed, true);
  t.equal(withOracle.answer, 42);
  t.equal(finding.oracleUsed, false);
  t.equal(finding.answer, 42);
});

test("#withOracle() on a Conclusive finding already using oracle returns the same instance", (t) => {
  const finding = Finding.conclusive(42, true);
  const withOracle = finding.withOracle();

  t.equal(finding, withOracle);
});

test("#withOracle() on an Inconclusive finding returns a new finding with oracleUsed set to true", (t) => {
  const finding = Finding.inconclusive(diagnostic);
  const withOracle = finding.withOracle();

  t.equal(withOracle.oracleUsed, true);
  t.equal(withOracle.diagnostic, diagnostic);
  t.equal(finding.oracleUsed, false);
  t.equal(finding.diagnostic, diagnostic);
});

test("#withOracle() on an Inconclusive finding already using oracle returns the same instance", (t) => {
  const finding = Finding.inconclusive(diagnostic, true);
  const withOracle = finding.withOracle();

  t.equal(finding, withOracle);
});

test("#equals() returns true for equal Conclusive findings", (t) => {
  const a = Finding.conclusive(42);
  const b = Finding.conclusive(42);

  t(a.equals(b));
});

test("#equals() returns false for Conclusive findings with different answers", (t) => {
  const a = Finding.conclusive(1);
  const b = Finding.conclusive(2);

  t(!a.equals(b));
});

test("#equals() returns true for equal Inconclusive findings", (t) => {
  const a = Finding.inconclusive(diagnostic);
  const b = Finding.inconclusive(diagnostic);

  t(a.equals(b));
});

test("#equals() returns false for Inconclusive findings with different diagnostics", (t) => {
  const a = Finding.inconclusive(Diagnostic.of("message a"));
  const b = Finding.inconclusive(Diagnostic.of("message b"));

  t(!a.equals(b));
});

test("#toJSON() serializes a Conclusive finding", (t) => {
  const finding = Finding.conclusive(42);

  t.deepEqual(finding.toJSON(), {
    type: "finding",
    kind: "conclusive",
    oracleUsed: false,
    answer: 42,
  });
});

test("#toJSON() serializes an Inconclusive finding", (t) => {
  const finding = Finding.inconclusive(diagnostic);

  t.deepEqual(finding.toJSON(), {
    type: "finding",
    kind: "inconclusive",
    oracleUsed: false,
    diagnostic: { message: diagnostic.message },
  });
});

test("#toString() returns a string representation for a Conclusive finding", (t) => {
  const finding = Finding.conclusive(42);

  t.equal(finding.toString(), "Conclusive { answer: 42 }");
});

test("#toString() returns a string representation for an Inconclusive finding", (t) => {
  const finding = Finding.inconclusive(diagnostic);

  t.equal(
    finding.toString(),
    `Inconclusive { diagnostic: ${diagnostic.message} }`,
  );
});
