import * as fs from "fs";
import ignore from "ignore";
import { spawn } from "./child-process";

/**
 * @param {string} command
 * @param {Array<string>} [options]
 * @return {string}
 */
export function git(command, options = []) {
  return spawn("git", [command, ...options]).stdout;
}

/**
 * @param {string} file
 */
export function stageFile(file) {
  git("add", [file]);
}

/**
 * @return {Array<string>}
 */
export function getStagedFiles() {
  const diff = git("diff", ["--name-only", "--cached", "--diff-filter", "d"]);

  if (diff === "") {
    return [];
  }

  return diff.split("\n");
}

/**
 * @param {string} file
 * @return {boolean}
 */
export function isStaged(file) {
  return getStagedFiles().indexOf(file) !== -1;
}

const gitignore = ignore().add(
  fs.readFileSync(require.resolve("../../.gitignore"), "utf8")
);

/**
 * @param {string} file
 * @return {boolean}
 */
export function isIgnored(file) {
  return gitignore.ignores(file);
}
