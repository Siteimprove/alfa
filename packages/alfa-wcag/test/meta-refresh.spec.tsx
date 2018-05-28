import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { audit } from "@siteimprove/alfa-act";

import { MetaRefresh } from "../src/meta-refresh/rule";
import { outcome } from "./helpers/outcome";

test("Passes when a refresh has a timeout of 0 and no URL", t => {
  const meta = <meta http-equiv="refresh" content="0" />;
  const document = (
    <html>
      <head>{meta}</head>
    </html>
  );

  const results = audit({ document }, MetaRefresh);

  outcome(t, results, { passed: [meta] });
});

test("Passes when a refresh has a timeout of 0 and a URL", t => {
  const meta = <meta http-equiv="refresh" content="0; http://example.com" />;
  const document = (
    <html>
      <head>{meta}</head>
    </html>
  );

  const results = audit({ document }, MetaRefresh);

  outcome(t, results, { passed: [meta] });
});

test("Fails when a refresh has a timeout greater than 0 and no URL", t => {
  const meta = <meta http-equiv="refresh" content="5" />;
  const document = (
    <html>
      <head>{meta}</head>
    </html>
  );

  const results = audit({ document }, MetaRefresh);

  outcome(t, results, { failed: [meta] });
});

test("Fails when a refresh has a timeout greater than 0 and a URL", t => {
  const meta = <meta http-equiv="refresh" content="5; http://example.com" />;
  const document = (
    <html>
      <head>{meta}</head>
    </html>
  );

  const results = audit({ document }, MetaRefresh);

  outcome(t, results, { failed: [meta] });
});
