const exec = require("execa");
const prettier = require("./tasks/prettier/transform");

async function stageFile(file) {
  await exec("git", ["add", file]);
}

async function stagedFiles() {
  const { stdout: files } = await exec("git", [
    "diff",
    "--name-only",
    "--cached",
    "--diff-filter=dx"
  ]);

  return files.split("\n");
}

async function lint() {
  const files = await stagedFiles();

  for (const file of files) {
    await prettier.onEvent(null, file, { onWrite: stageFile });
  }
}

lint();
