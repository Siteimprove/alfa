import axios from "axios";
import { simpleGit } from "simple-git";
import * as path from "node:path";

const url = process.env.COVERAGE_API_URL;
const apiKey = process.env.COVERAGE_API_KEY;
const webHookUrl = process.env.COVERAGE_WEBHOOK_URL;

const configFile = path.join("config", "upload-coverage-report.json");
const summaryFile = path.join("docs", "coverage", "coverage-summary.json");

const targetPath = process.argv[2] ?? ".";

const git = simpleGit(targetPath);

await uploadCoverageReport(targetPath);

/**
 * Upload coverage report to the specified URL with the provided API key.
 *
 * @remarks
 * This uses custom Siteimprove reporting format, likely unusable elsewhere.
 *
 * @internal
 */
export async function uploadCoverageReport(rootDir: string) {
  const config = (
    await import(path.join(rootDir, configFile), {
      with: { type: "json" },
    })
  ).default;

  const summary = (
    await import(path.join(rootDir, summaryFile), {
      with: { type: "json" },
    })
  ).default;

  const git_sha = (await git.revparse(["HEAD"])).trim();

  const payload = {
    ...config,
    line_rate: summary.total.lines.pct / 100,
    lines_covered: summary.total.lines.covered,
    lines_valid: summary.total.lines.total,
    timestamp_s: Math.floor(Date.now() / 1000),
    git_sha,
  };

  if ((url ?? "") === "" || (apiKey ?? "") === "") {
    console.group("Upload Coverage Report - Missing Configuration");
    console.warn(
      "COVERAGE_API_URL and COVERAGE_API_KEY must be set in the environment.",
    );
    console.warn("Skipping API upload.");
    console.groupEnd();
  } else {
    // url cannot be undefined as it would have defaulted to "" in the test.
    const response = await axios.post(url!, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    console.group("Upload Coverage Report - API Response");
    console.dir(response.data);
    console.groupEnd();
  }

  if (webHookUrl ?? "" !== "") {
    const response = await axios.post(
      // webHookUrl cannot be undefined as it would have defaulted to "" in the test.
      webHookUrl!,
      {
        service_alias: config.service_alias,
        coverage: summary.total.lines.pct,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.group("Upload Coverage Report - Webhook Response");
    console.dir(response.data);
    console.groupEnd();
  } else {
    console.group("Upload Coverage Report - Missing Webhook Configuration");
    console.warn("COVERAGE_WEBHOOK_URL is not set in the environment.");
    console.warn("Skipping webhook notification.");
    console.groupEnd();
  }
}
