import axios from "axios";
import { simpleGit } from "simple-git";

const url = process.env.API_URL;
const apiKey = process.env.API_KEY;

const configFile = "config/upload-coverage-report.json";
const summaryFile = "docs/coverage/coverage-summary.json";

const targetPath = process.argv[2] ?? ".";

const git = simpleGit(targetPath);

await uploadCoverageReport(targetPath);

export async function uploadCoverageReport(cwd: string) {
  const config = await import(`${cwd}/${configFile}`, {
    with: { type: "json" },
  });

  const summary = await import(`${cwd}/${summaryFile}`, {
    with: { type: "json" },
  });

  const git_sha = (await git.revparse(["HEAD"])).trim();

  // Add lines_rate, lines_covered, lines_valid, timestamp (in seconds), and git_sha to payload
  const payload = {
    ...config,
    lines_rate: summary.total.lines.pct / 100,
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
      "X-API-key": apiKey,
    },
  });

  return response.data;
}
