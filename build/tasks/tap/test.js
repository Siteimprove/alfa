const { cpus } = require("os");
const { notify } = require("wsk");
const { gray, reset } = require("chalk");
const tap = require("tap");
const Parser = require("tap-parser");
const { diff } = require("concordance");
const { read } = require("../../utils/file");
const { CodeError } = require("../../utils/error");
const { theme } = require("./concordance");
const nyc = require.resolve("nyc/bin/nyc");
const environment = require.resolve("./environment");

const parser = new Parser();

parser.on("child", test => {
  const { name: path } = test;
  const results = [];
  const logs = [];

  test.on("extra", line => logs.push(line));

  test.on("child", test => {
    test.on("complete", ({ ok, failures }) => {
      if (!ok) {
        results.push({ name: test.name, failures });
      }
    });
  });

  test.on("complete", async ({ ok }) => {
    if (logs.length !== 0) {
      notify({
        message: "Logs from",
        value: path,
        display: ["gray"]
      });

      console.log(logs.join("").trim());
    }

    if (ok) {
      notify({
        message: "Tests passed",
        value: path,
        display: "success"
      });
    } else {
      for (const { name, failures } of results) {
        notify({
          message: `Test ${ok ? "passed" : "failed"}`,
          value: `${path} ${reset.dim(name)}`,
          display: ok ? "success" : "error"
        });

        if (logs.length !== 0) {
          console.log(`\n${gray("Logs:")}\n\n${logs.join("\n")}`);
        }

        for (const { name, diag } of failures) {
          const { found, wanted } = diag;
          const { line, column, file } = diag.at;

          const source = await read(file);

          notify({
            message: `${gray("---")} ${name}`,
            display: "error",
            extend: {
              desktop: false
            },
            error: new CodeError(source, {
              line,
              column
            })
          });

          if (found !== undefined && wanted !== undefined) {
            console.log(
              `\n${gray("Difference:")}\n\n${diff(found, wanted, { theme })}`
            );
          }
        }
      }
    }
  });
});

tap.jobs = cpus().length;

tap.pipe(parser);

async function onEvent(event, path) {
  if (/\.spec\.tsx?/.test(path)) {
    await tap.spawn(
      nyc,
      ["--silent", "--cache", "--", "node", "--require", environment, path],
      path
    );
  }
}

module.exports = { onEvent };
