import axios from "axios";
import { simpleGit } from "simple-git";
import * as path from "node:path";

const url = process.env.COVERAGE_API_URL;
const apiKey = process.env.COVERAGE_API_KEY;

const configFile = path.join("config", "upload-coverage-report.json");
const summaryFile = path.join("docs", "coverage/coverage-summary.json");

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
 * @knipignore Used in workflows
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

  if (!url || !apiKey) {
    throw new Error(
      "COVERAGE_API_URL and COVERAGE_API_KEY must be set in the environment.",
    );
  }

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.data;
}
