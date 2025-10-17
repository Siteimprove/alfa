import axios from "axios";
import { simpleGit } from "simple-git";

const url = process.env.COVERAGE_API_URL;
const apiKey = process.env.COVERAGE_API_KEY;

const configFile = "config/upload-coverage-report.json";
const summaryFile = "docs/coverage/coverage-summary.json";

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
    await import(`${rootDir}/${configFile}`, {
      with: { type: "json" },
    })
  ).default;

  const summary = (
    await import(`${rootDir}/${summaryFile}`, {
      with: { type: "json" },
    })
  ).default;

  // console.dir(config);
  // console.dir(summary);

  const git_sha = (await git.revparse(["HEAD"])).trim();

  // Add lines_rate, lines_covered, lines_valid, timestamp (in seconds), and git_sha to payload
  const payload = {
    ...config,
    line_rate: summary.total.lines.pct / 100,
    lines_covered: summary.total.lines.covered,
    lines_valid: summary.total.lines.total,
    timestamp_s: Math.floor(Date.now() / 1000),
    git_sha,
  };

  if (!url || !apiKey) {
    throw new Error("API_URL and API_KEY must be set in environment variables");
  }

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.data;
}
